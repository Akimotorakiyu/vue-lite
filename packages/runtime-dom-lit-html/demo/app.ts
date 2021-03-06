import {
  defineComponent,
  reactive,
  html,
  onMounted,
  onUpdated,
  onUnmounted,
} from "../src";

defineComponent("my-component", {}, () => {
  const state = reactive({
    text: "hello",
    show: true,
  });
  const toggle = () => {
    state.show = !state.show;
  };
  const onInput = (e: InputEvent) => {
    const inputElement = <HTMLInputElement>e.target!;
    state.text = inputElement.value;
  };

  return () => html`
    <button @click=${toggle}>toggle child</button>
    <p>${state.text} <input value=${state.text} @input=${onInput} /></p>
    ${state.show ? html`<my-child msg=${state.text}></my-child>` : ``}
  `;
});

defineComponent("my-child", { msg: "" }, (props) => {
  const state = reactive({ count: 0 });
  const increase = () => {
    state.count++;
  };

  onMounted(() => {
    console.log("child mounted");
  });

  onUpdated(() => {
    console.log("child updated");
  });

  onUnmounted(() => {
    console.log("child unmounted");
  });

  return () => html`
    <p>${props.msg}</p>
    <p>${state.count}</p>
    <button @click=${increase}>increase</button>
  `;
});

const myCom = document.createElement("my-component");
document.getElementById("app")!.appendChild(myCom);
