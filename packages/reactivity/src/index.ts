import { isObject } from "./share";

//
function trigger() {}
function track() {}

function reactive<T extends object>(target: T) {
  if (isObject(target)) {
    console.warn(`value cannot be made reactive: ${String(target)}`);
    return target;
  }

  return new Proxy(target, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      track();
      return isObject ? reactive(value) : value;
    },
    set(target, key, newValue, receiver) {
      const oldValue = Reflect.get(target, key, receiver);
      const result = Reflect.set(target, key, newValue, receiver);
      trigger();
      return result;
    },
    deleteProperty(target, key) {
      const oldValue = Reflect.get(target, key);
      const result = Reflect.deleteProperty(target, key);
      trigger();
      return result;
    },
    has(target, key) {
      const has = Reflect.has(target, key);
      track();
      return has;
    },
    ownKeys(target) {
      const keys = Reflect.ownKeys(target);
      track();
      return keys;
    },
  });
}

function effect(fn: () => void) {
  return function reactiveEffect() {};
}

function computed<T>(target: T) {
  let value;
  let dirty;

  return {
    get value() {
      track();
      return value;
    },
    set value(newValue: T) {
      track();
    },
  };
}

reactive(new String(""));
