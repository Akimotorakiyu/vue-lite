import { effect, trigger, track } from "./effect";
import { ComputedRef } from "./type";

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
