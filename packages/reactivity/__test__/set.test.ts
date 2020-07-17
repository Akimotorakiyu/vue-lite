import { reactive, effect, computed } from "../src/index";

describe("reactive proxy array", () => {
  test("reactive", () => {
    const values = reactive(new Set<number>());

    values.add(0);

    expect(Array.from(values.values())[0]).toBe(0);

    values.add(1);

    expect(Array.from(values.values())[1]).toBe(1);
  });

  //   test("reactive-effect", () => {
  //     const values = reactive([1, 2, 3, 4]);

  //     let value;

  //     effect(() => {
  //       value = values[1];
  //     });

  //     values[1] = 0;

  //     expect(value).toBe(0);
  //   });
});

export {};
