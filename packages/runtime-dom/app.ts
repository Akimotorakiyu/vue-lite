import { defineComponent, t, h, createApp, ob, cb, PatchFlag } from "./src";
export const welcome = "greeting: runtime-dom!";

const root = document.querySelector("#app");

function toString(o: any) {
  return JSON.stringify(o);
}

const App = defineComponent({
  props: {
    name: "",
  },
  setup(props) {
    return {
      greeting: `${props.name}: hello world!`,
    };
  },
  render(_ctx, _props) {
    return [
      (ob(),
      cb("div", {}, [
        t("hello world" + 1 + JSON.stringify(_ctx), {}, [], PatchFlag.props),
        h(
          "button",
          {
            onClick: () => {
              console.log("单击" + _ctx.greeting);
            },
            onDblclick: () => {
              console.log("双击" + _ctx.greeting);
            },
          },
          [t("我是按钮")]
        ),
      ])),
    ];
  },
});

const appRoot = h(App, { name: "vue-lite" });

const app = createApp(appRoot).mount(root);

Reflect.set(window, "app", app);

console.log(app, JSON.stringify(app, undefined, 2));
