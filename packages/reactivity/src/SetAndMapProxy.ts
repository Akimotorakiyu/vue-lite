import { proxyToRaw, isObject } from "./share";
import { reactive } from "./reactive";
import { trigger, track } from "./effect";
import { setClassPrototypeProxyMap } from ".";
/**
 * Set的原型链代理
 *
 * @class ProxySet
 * @extends {Set<T>}
 * @template T
 */
class ProxySet<T> extends Set<T> {
  add(value: T) {
    super.add.call(proxyToRaw.get(this), value);
    trigger(this, "length", undefined, undefined);
    return this;
  }

  values() {
    track(this, "length");
    const iterableIterator: IterableIterator<T> = super.values.call(
      proxyToRaw.get(this)
    ) as IterableIterator<T>;

    const newIterableIterator: IterableIterator<T> = {
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
    super.clear.call(proxyToRaw.get(this));
    trigger(this, "length", undefined, undefined);
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
    const iterableIterator: IterableIterator<T> = super.keys.call(
      proxyToRaw.get(this)
    );

    const newIterableIterator: IterableIterator<T> = {
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
    const iterableIterator: IterableIterator<[T, T]> = super.entries.call(
      proxyToRaw.get(this)
    );

    const newIterableIterator: IterableIterator<[T, T]> = {
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
/**
 * Map的原型链代理
 *
 * @class ProxyMap
 * @extends {Map<K, V>}
 * @template K
 * @template V
 */
class ProxyMap<K, V> extends Map<K, V> {
  set(key: K, value: V) {
    super.set.call(proxyToRaw.get(this), key, value);
    trigger(this, "length", undefined, undefined);
    return this;
  }

  values() {
    track(this, "length");
    const iterableIterator: IterableIterator<V> = super.values.call(
      proxyToRaw.get(this)
    ) as IterableIterator<V>;

    const newIterableIterator: IterableIterator<V> = {
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
    super.clear.call(proxyToRaw.get(this));
    trigger(this, "length", undefined, undefined);
  }

  has(key: K) {
    track(this, "length");
    return super.has.call(proxyToRaw.get(this), key);
  }

  forEach(fn: Parameters<Map<K, V>["forEach"]>[0]) {
    for (const iterator of this.entries()) {
      fn(iterator[1], iterator[0], this);
    }
    return;
  }

  keys() {
    track(this, "length");
    const iterableIterator: IterableIterator<K> = super.keys.call(
      proxyToRaw.get(this)
    );

    const newIterableIterator: IterableIterator<K> = {
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
    const iterableIterator: IterableIterator<[K, V]> = super.entries.call(
      proxyToRaw.get(this)
    );

    const newIterableIterator: IterableIterator<[K, V]> = {
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

  delete(key: K) {
    trigger(this, "length", undefined, undefined);
    return super.delete.call(proxyToRaw.get(this), key);
  }

  get size() {
    track(this, "length");
    return Reflect.get(Map.prototype, "size", proxyToRaw.get(this));
  }
}

setClassPrototypeProxyMap(ProxySet);
setClassPrototypeProxyMap(ProxyMap);
