import { isObject, isReactiveObject, proxyToRaw } from "./share";
import { ReactiveObject, reactiveObjectKey, Constructor } from "./type";

import { track, trigger } from "./effect";

// todo: add allowList, good first issue
// export const allowList = ["Map", "Set"];
// 自定义原型链关系
export const classPrototypeProxyMap = new Map<object, Constructor<object>>();

/**
 * 设置原型链关系
 *
 * @export
 * @template T
 * @param {Constructor<T>} functionConstructor
 */
export function setClassPrototypeProxyMap<T>(
  functionConstructor: Constructor<T>
) {
  classPrototypeProxyMap.set(
    Reflect.getPrototypeOf(functionConstructor.prototype),
    (functionConstructor as Constructor<unknown>) as Constructor<object>
  );
}
/**
 * 设置原型链代理
 *
 * @export
 * @template T
 * @param {T} target
 */
export function setTargetPrototypeProxy<T extends object>(target: T) {
  let proto = Reflect.getPrototypeOf(target);
  let newProto: object;

  while (true) {
    newProto = classPrototypeProxyMap.get(proto)?.prototype;

    if (!newProto) {
      break;
    }

    Reflect.setPrototypeOf(target, newProto);
    proto = newProto;
  }
}

/**
 * 创建响应式对象
 *
 * @export
 * @template T
 * @param {(T | ReactiveObject<T>)} target
 * @returns
 */
export function reactive<T extends object>(target: T | ReactiveObject<T>) {
  if (!isObject(target)) {
    console.warn(`value cannot be made reactive: ${String(target)}`);
    return target;
  }

  if (isReactiveObject(target)) {
    return target[reactiveObjectKey];
  }

  setTargetPrototypeProxy(target);

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

  Object.defineProperty(target, Symbol.for("reactiveObjectKey"), {
    writable: false,
    enumerable: false,
    value: obsver,
  });

  proxyToRaw.set(obsver, target);

  return obsver;
}
