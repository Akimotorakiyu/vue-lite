import { isObject, isReactiveObject, proxyToRaw } from "./share";
import { ReactiveObject, reactiveObjectKey, Constructor } from "./type";

import { track, trigger } from "./effect";

// todo: add allowList, good first issue
// export const allowList = ["Map", "Set"];
export const classPrototypeProxyMap = new Map<object, Constructor<object>>();

export function setClassPrototypeProxyMap<T>(
  functionConstructor: Constructor<T>
) {
  console.log(classPrototypeProxyMap);
  classPrototypeProxyMap.set(
    Reflect.getPrototypeOf(functionConstructor.prototype),
    (functionConstructor as Constructor<unknown>) as Constructor<object>
  );
}

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
