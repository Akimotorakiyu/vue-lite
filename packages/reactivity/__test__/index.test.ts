import { reactive, effect, computed } from "../src/index";

describe("reactive proxy", () => {
  test("reactive", () => {
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

  test("reactive-effect", () => {
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

    expect(desc.value).toBe("user-school");
  });

  test("computed-effect", () => {
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

    let descString = "";

    effect(() => {
      descString = desc.value;
    });

    user.school.name = "user-school";

    expect(desc.value).toBe("user-user-school");
  });
});

export {};
