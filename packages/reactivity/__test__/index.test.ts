import { reactive, effect, computed } from "../src/index";

describe("reactive proxy", () => {
  test("get handler adn set handler", () => {
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
    console.log("-----------------------")
  });

  test("effect", () => {
    const user = reactive({
      name: "user",
      age: 18,
      school: {
        name: "shcool",
        age: 100,
      },
    });

    let schoolName = "";

    effect(() => {
      schoolName = user.school.name;
      console.log( user.school.name)
    });

    user.school.name = "user-school";

    expect(schoolName).toBe("user-school");
  });
});

export {};
