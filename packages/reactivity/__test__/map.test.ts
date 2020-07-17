import { reactive, effect, computed } from "../src/index";

describe("reactive proxy Map", () => {
  test("reactive", () => {
    const values = reactive(new Map<number, number>());

    values.set(0, 0);

    expect(Array.from(values.values())[0]).toBe(0);
    expect(Array.from(values.keys())[0]).toBe(0);
    expect(Array.from(values.entries())[0][1]).toBe(0);

    values.set(1, 1);

    expect(Array.from(values.values())[1]).toBe(1);
    expect(Array.from(values.keys())[1]).toBe(1);
    expect(Array.from(values.entries())[1][1]).toBe(1);
  });

  test("reactive-effect", () => {
    const values = reactive(new Map<number, number>());

    values.set(0, 0);

    values.set(1, 1);

    let size = 0;

    effect(() => {
      size = values.size;
    });

    values.set(1, 1);

    expect(size).toBe(values.size);
  });

  test("reactive-effect", () => {
    const values = reactive(new Map<number, number>());

    values.set(0, 0);

    values.set(1, 1);
    values.delete(0);

    let size = 0;

    effect(() => {
      size = values.size;
    });

    values.set(1, 1);

    expect(size).toBe(values.size);
    expect(Array.from(values.values())[0]).toBe(1);
  });

  test("reactive-effect", () => {
    const values = reactive(new Map<number, number>());

    values.set(0, 0);

    values.set(1, 1);

    let size = 0;

    effect(() => {
      size = values.size;
    });

    values.set(2, 2);

    values.clear();
    expect(size).toBe(values.size);
  });

  test("reactive-effect", () => {
    const values = reactive(new Map<number, number>());

    values.set(0, 0);

    values.set(1, 1);

    let has = false;

    effect(() => {
      has = values.has(2);
    });

    values.set(2, 2);
    expect(has).toBe(true);

    values.clear();
    expect(has).toBe(false);
  });
});

export {};
