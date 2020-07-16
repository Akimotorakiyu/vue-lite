import { isObject, isArrayIndex, isReactiveObject } from "./share";
import {
  KeyToDepMap,
  ProxyHandlerKey,
  ReactiveEffectOptions,
  ReactiveEffect,
  ComputedRef,
  ReactiveObject,
} from "./type";

const targetMap = new WeakMap<object, KeyToDepMap>();

let activeEffect: ReactiveEffect<unknown, []> | undefined;
// 临时存储依赖的函数栈
const effectStack: ReactiveEffect<unknown, []>[] = [];
let id = 0;

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
function trigger<T extends object, N, O>(
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

function track<T extends object>(target: T, key: ProxyHandlerKey) {
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

export function reactive<T extends object>(target: T | ReactiveObject<T>) {
  if (!isObject(target)) {
    console.warn(`value cannot be made reactive: ${String(target)}`);
    return target;
  }

  if (isReactiveObject(target)) {
    return target[Symbol.for("reactiveObjectKey")];
  }

  const obsver = new Proxy(target, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      track(target, key);
      return isObject(value) ? reactive(value) : value;
    },
    set(target, key, newValue, receiver) {
      const oldValue = Reflect.get(target, key, receiver);
      const result = Reflect.set(target, key, newValue, receiver);
      trigger(target, key, newValue, oldValue);
      return result;
    },
    deleteProperty(target, key) {
      const oldValue = Reflect.get(target, key);
      const result = Reflect.deleteProperty(target, key);
      trigger(target, key, undefined, oldValue);
      return result;
    },
    has(target, key) {
      const has = Reflect.has(target, key);
      track(target, key);
      return has;
    },
    ownKeys(target) {
      const keys = Reflect.ownKeys(target);
      keys.forEach((key) => {
        track(target, key);
      });
      return keys;
    },
  }) as ReactiveObject<T>;

  Object.defineProperty(obsver, Symbol.for("reactiveObjectKey"), {
    writable: false,
    enumerable: false,
    value: obsver,
  });

  return obsver;
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

function isReactiveEffect<T, A extends []>(
  value: ReactiveEffect<T, A> | ((...args: A) => T)
): value is ReactiveEffect<T, A> {
  return (value as ReactiveEffect<T, A>)?._isEffect ? true : false;
}

function createReactiveEffect<T, A extends []>(
  fn: (...args: A) => T,
  options: ReactiveEffectOptions<T, A> = {}
) {
  const effect = function reactiveEffect(...args: A) {
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
  } as ReactiveEffect<T, A>;

  effect.id = id++;
  effect.active = true;
  effect.relayedInDependencies = [];
  effect.rawFunction = fn;
  effect.options = options;
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

export function computed<T, A extends []>(
  getter: (...args: A) => T,
  setter?: (value: T) => void
) {
  let value: T;
  let dirty = true;

  const runner = effect(getter, {
    lazy: true,
    scheduler() {
      if (!dirty) {
        dirty = true;
        // 只是用来触发依赖computed的相关effect执行
        // 当获取value时，会在getter中直接执行effect
        trigger(computed, "value", undefined, undefined);
      }
    },
  });

  const computed: ComputedRef<T, A> = {
    effect: runner,
    get value() {
      if (dirty) {
        value = runner();
        dirty = false;
      }
      track(computed, "value");
      return value;
    },
    set value(newValue: T) {
      // computed 本身是计算的结果，它的值是不可改的
      // 这里目的提供途径去修改computed的源，来触发computed的修改
      if (setter) {
        setter(newValue);
      }
    },
  };

  return computed;
}
