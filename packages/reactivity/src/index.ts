import { isObject } from "./share";
import { KeyToDepMap, ProxyHandlerKey } from "./type";

//
function trigger<T extends object, N, O>(
  target: T,
  key: ProxyHandlerKey,
  newValue: N,
  oldValue: O
) {}
function track<T extends object>(target: T, key: ProxyHandlerKey) {}

function reactive<T extends object>(target: T) {
  if (!isObject(target)) {
    console.warn(`value cannot be made reactive: ${String(target)}`);
    return target;
  }

  return new Proxy(target, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      track(target, key);
      return isObject ? reactive(value) : value;
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
  });
}

const targetMap = new WeakMap<object, KeyToDepMap>();

function effect(fn: () => void) {
  return function reactiveEffect() {};
}

function computed<T>(getter: () => T) {
  let value;
  let dirty;

  const runner = effect(getter);

  const computed = {
    get value() {
      if (dirty) {
        runner();
        dirty = false;
      }
      track(computed, "value");
      return value;
    },
    set value(newValue: T) {
      const oldValue = value;
      value = newValue;
      trigger(computed, "value", newValue, oldValue);
    },
  };

  return computed;
}

reactive(new String(""));
