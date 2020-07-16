import {
  ProxyHandlerKey,
  ArrayIndex,
  ReactiveObject,
  ReactiveEffect,
} from "./type";

export function isObject(value: unknown): value is object {
  return value !== null && typeof value === "object";
}

export function isArrayIndex(key: ProxyHandlerKey): key is ArrayIndex {
  return (
    String(parseInt(String(key))) === String(key) && typeof key !== "symbol"
  );
}

export function isReactiveObject<T extends object>(
  target: T | ReactiveObject<T>
): target is ReactiveObject<T> {
  return target[Symbol.for("reactiveObjectKey")] ? true : false;
}

export function isReactiveEffect<T, A extends []>(
  value: ReactiveEffect<T, A> | ((...args: A) => T)
): value is ReactiveEffect<T, A> {
  return (value as ReactiveEffect<T, A>)?._isEffect ? true : false;
}
