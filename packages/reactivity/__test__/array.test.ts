import { reactive, effect } from "../src/index";

describe("reactive proxy array", () => {
  test("reactive", () => {
    const values = reactive([1, 2, 3, 4]);

    values[1] = 0;

    expect(values[1]).toBe(0);
  });

  test("reactive-effect", () => {
    const values = reactive([1, 2, 3, 4]);

    let value;

    effect(() => {
      value = values[1];
    });

    values[1] = 0;

    expect(value).toBe(0);
  });

  test("reactive-effect-splice", () => {
    const values = reactive([1, 2, 3, 4]);

    let value;

    effect(() => {
      value = values[1];
    });

    values.splice(1, 1, 0);

    expect(value).toBe(0);
  });

  test("reactive-effect-push", () => {
    const values = reactive([1, 2, 3, 4]);

    let value;

    effect(() => {
      value = values[values.length - 1];
    });

    values.push(0);

    expect(value).toBe(0);
  });

  test("reactive-effect-length", () => {
    const values = reactive([1, 2, 3, 4]);

    let value;

    effect(() => {
      value = values[2];
    });

    values.length = 2;

    expect(value).toBe(undefined);
  });

  test("reactive-effect-length", () => {
    const values = reactive([1, 2, 3, 4]);

    let value;

    effect(() => {
      value = values[2];
    });

    values.length = 2;
    values.length = 4;

    expect(value).toBe(values[values.length - 1]);
  });
});

export {};
