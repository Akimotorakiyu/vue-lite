import { ProxyHandlerKey, ArrayIndex } from "./type";

export function isObject(value: unknown): value is object {
  return value !== null && typeof value === "object";
}

export function isArrayIndex(key: ProxyHandlerKey): key is ArrayIndex {
  return (
    String(parseInt(String(key))) === String(key) && typeof key !== "symbol"
  );
}
