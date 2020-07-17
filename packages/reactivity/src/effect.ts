import {
  ReactiveEffect,
  ReactiveEffectOptions,
  KeyToDepMap,
  ProxyHandlerKey,
} from "./type";
import { isReactiveEffect, isArrayIndex } from "./share";

let activeEffect: ReactiveEffect<unknown, []> | undefined;
// 临时存储依赖的函数栈
const effectStack: ReactiveEffect<unknown, []>[] = [];
let id = 0;

const targetMap = new WeakMap<object, KeyToDepMap>();

function triggerForArrrayLength<T extends object, O>(
  target: T,
  key: ProxyHandlerKey,
  newValue: number,
  oldValue: O
) {
  const depMaps = targetMap.get(target);

  const effects = new Set<ReactiveEffect<unknown, []>>();

  depMaps.forEach((effectSets, keyForDep) => {
    if (
      keyForDep === "length" ||
      (isArrayIndex(keyForDep) && keyForDep >= newValue)
    ) {
      effectSets.forEach((effect) => {
        if (effect !== activeEffect) {
          effects.add(effect);
        } else {
          // the effect mutated its own dependency during its execution.
          // this can be caused by operations like foo.value++
          // do not trigger or we end in an infinite loop
        }
      });
    }
  });

  effects.forEach((effect: ReactiveEffect<unknown, []>) => {
    if (effect.options.onTrigger) {
      effect.options.onTrigger({
        effect,
        target,
        key,
        newValue,
        oldValue,
      });
    }
    if (effect.options.scheduler) {
      effect.options.scheduler(effect);
    } else {
      effect();
    }
  });
}

function triggerForObject<T extends object, N, O>(
  target: T,
  key: ProxyHandlerKey,
  newValue: N,
  oldValue: O
) {
  const depMaps = targetMap.get(target);

  const effectSets = depMaps.get(key);
  if (!effectSets) {
    return;
  }

  const effects = new Set<ReactiveEffect<unknown, []>>();

  effectSets.forEach((effect) => {
    if (effect !== activeEffect) {
      effects.add(effect);
    } else {
      // the effect mutated its own dependency during its execution.
      // this can be caused by operations like foo.value++
      // do not trigger or we end in an infinite loop
    }
  });

  effects.forEach((effect: ReactiveEffect<unknown, []>) => {
    if (effect.options.onTrigger) {
      effect.options.onTrigger({
        effect,
        target,
        key,
        newValue,
        oldValue,
      });
    }
    if (effect.options.scheduler) {
      effect.options.scheduler(effect);
    } else {
      effect();
    }
  });
}

//
export function trigger<T extends object, N, O>(
  target: T,
  key: ProxyHandlerKey,
  newValue: N,
  oldValue: O
) {
  const depMaps = targetMap.get(target);

  if (!depMaps) {
    return;
  }

  if (key === "length" && Array.isArray(target)) {
    triggerForArrrayLength(target, key, parseInt(String(newValue)), oldValue);
  } else {
    triggerForObject(target, key, newValue, oldValue);
  }
}

export function track<T extends object>(target: T, key: ProxyHandlerKey) {
  if (!activeEffect) {
    return;
  }

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
    activeEffect.relayedInDependencies.push(dep);

    if (activeEffect.options.onTrack) {
      activeEffect.options.onTrack({
        effect: activeEffect,
        target,
        key,
      });
    }
  }
}

/**
 * 清理effect的依赖关系
 *
 * effect的第一次执行，是在effect创建完成之后，cleanup的第一次执行也是在创建完成之后，此时deps至少是一个空数组
 *
 * @param {ReactiveEffect} effect
 */
function cleanup(effect: ReactiveEffect<unknown, []>) {
  const { relayedInDependencies } = effect;

  relayedInDependencies.forEach((dependencies) => {
    dependencies.delete(effect);
  });

  effect.relayedInDependencies = [];
}

export function stop(effect: ReactiveEffect<unknown, []>) {
  if (effect.active) {
    cleanup(effect);
    if (effect.options.onStop) {
      effect.options.onStop();
    }
    effect.active = false;
  }
}

function createReactiveEffect<T, A extends []>(
  fn: (...args: A) => T,
  options: ReactiveEffectOptions<T, A> = {}
) {
  const effect = Object.assign(
    function reactiveEffect(...args: A) {
      if (!effect.active) {
        return options.scheduler ? undefined : fn(...args);
      }
      if (!effectStack.includes(effect)) {
        cleanup(effect);
        try {
          effectStack.push(effect);
          activeEffect = effect;

          return fn(...args);
        } finally {
          effectStack.pop();
          activeEffect = effectStack[effectStack.length - 1];
        }
      }
    },
    {
      id: id++,
      _isEffect: true,
      active: true,
      relayedInDependencies: [],
      rawFunction: fn,
      options: options,
    }
  ) as ReactiveEffect<T, A>;

  return effect;
}

export function effect<T, A extends []>(
  fn: ReactiveEffect<T, A> | ((...args: A) => T),
  options: ReactiveEffectOptions<T, A> = {}
) {
  const effect = isReactiveEffect(fn)
    ? createReactiveEffect(fn.rawFunction, options)
    : createReactiveEffect(fn, options);
  if (!options.lazy) {
    effect();
  }
  return effect;
}
