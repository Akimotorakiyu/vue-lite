import { reactive, effect, computed } from "../src/index";

describe("reactive proxy", () => {
  test("get handler adn set handler", () => {
    const user = reactive({
      name: "user",
      age: 18,
      school: {
        name: "school",
        age: 100,
      },
    });

    user.school.name = "user school";

    expect(user.school.name).toBe("user school");
  });

  test("effect", () => {
    const user = reactive({
      name: "user",
      age: 18,
      school: {
        name: "school",
        age: 100,
      },
    });

    let schoolName = "";

    effect(() => {
      schoolName = user.school.name;
    });

    user.school.name = "user-school";

    expect(schoolName).toBe("user-school");
  });

  test("computed", () => {
    const user = reactive({
      name: "user",
      age: 18,
      school: {
        name: "school",
        age: 100,
      },
    });

    const desc = computed(() => {
      return `${user.name}-${user.school.name}`;
    });

    desc.value;

    expect(desc.value).toBe("user-school");
  });
});

export {};
