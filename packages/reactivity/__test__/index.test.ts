import { reactive, effect, computed } from "../src/index";
describe("reactive", () => {
  test("reactive", () => {
    const user = reactive({
      name: "user",
      age: 18,
      school: {
        name: "shcool",
        age: 100,
      },
    });

    user.school.name = "user school";

    expect(user.school.name).toBe("user school");
  });
});

export {}