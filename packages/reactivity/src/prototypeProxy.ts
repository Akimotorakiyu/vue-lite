import { Constructor } from "./type";

export const classPrototypeProxyMap = new Map<object, Constructor<object>>();

export function setClassPrototypeProxyMap<T>(
  functionConstructor: Constructor<T>
) {
  classPrototypeProxyMap.set(
    Reflect.getPrototypeOf(functionConstructor.prototype),
    (functionConstructor as Constructor<unknown>) as Constructor<object>
  );
}

export function setTargetPrototypeProxy<T extends object>(target: T) {
  const proto = Reflect.getPrototypeOf(target);
  let newProto: object;

  while (true) {
    newProto = classPrototypeProxyMap.get(proto)?.prototype;

    if (!newProto) {
      break;
    }

    Reflect.setPrototypeOf(target, newProto);
  }
}
