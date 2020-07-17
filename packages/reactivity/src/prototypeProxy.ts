import { Constructor } from "./type";
import { proxyToRaw, isObject } from "./share";
import { track, trigger, reactive } from "./index";

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

class ProxySet<T> extends Set<T> {
  add(value: T) {
    super.add.call(proxyToRaw.get(this), value);
    trigger(this, "length", undefined, undefined);
    return this;
  }

  values(): IterableIterator<T> {
    track(this, "length");
    const iterableIterator = super.values.call(
      proxyToRaw.get(this)
    ) as IterableIterator<T>;

    const newIterableIterator = {
      [Symbol.iterator]() {
        return newIterableIterator;
      },
      next() {
        const iterator = iterableIterator.next();
        return iterator.done
          ? iterator
          : isObject(iterator.value)
          ? {
              value: reactive(iterator.value),
              done: false,
            }
          : {
              value: iterator.value,
              done: false,
            };
      },
    };

    return newIterableIterator;
  }

  clear() {
    trigger(this, "length", undefined, undefined);
    return super.clear.call(proxyToRaw.get(this));
  }

  has(value: T) {
    track(this, "length");
    return super.has.call(proxyToRaw.get(this), value);
  }

  forEach(fn: Parameters<Set<T>["forEach"]>[0]) {
    for (const iterator of this.values()) {
      fn(iterator, iterator, this);
    }
    return;
  }

  keys() {
    track(this, "length");
    const iterableIterator = super.keys.call(
      proxyToRaw.get(this)
    ) as IterableIterator<T>;

    const newIterableIterator = {
      [Symbol.iterator]() {
        return newIterableIterator;
      },
      next() {
        const iterator = iterableIterator.next();
        return iterator.done
          ? iterator
          : isObject(iterator.value)
          ? {
              value: reactive(iterator.value),
              done: false,
            }
          : {
              value: iterator.value,
              done: false,
            };
      },
    };

    return newIterableIterator;
  }

  entries() {
    track(this, "length");
    const iterableIterator = super.entries.call(
      proxyToRaw.get(this)
    ) as IterableIterator<T>;

    const newIterableIterator = {
      [Symbol.iterator]() {
        return newIterableIterator;
      },
      next() {
        const iterator = iterableIterator.next();
        return iterator.done
          ? iterator
          : isObject(iterator.value)
          ? {
              value: reactive(iterator.value),
              done: false,
            }
          : {
              value: iterator.value,
              done: false,
            };
      },
    };

    return newIterableIterator;
  }

  delete(value: T) {
    trigger(this, "length", undefined, undefined);
    return super.delete.call(proxyToRaw.get(this), value);
  }

  get size() {
    track(this, "length");
    return Reflect.get(Set.prototype, "size", proxyToRaw.get(this));
  }
}

setClassPrototypeProxyMap(ProxySet);
