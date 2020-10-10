import { render, html, TemplateResult } from "lit-html";
export { html, TemplateResult } from "lit-html";

import { effect, reactive } from "@vue-lite/reactivity";
export { reactive } from "@vue-lite/reactivity";

export type CallBack<Args extends unknown[] = unknown[], V = void> = (
  ...args: Args
) => V;

class VueLiteHTMLElement extends HTMLElement {
  _props = reactive({});
  _onBeforeMount: CallBack[] = [];
  _onMounted: CallBack[] = [];
  _onBeforeUpdate: CallBack[] = [];
  _onUpdated: CallBack[] = [];
  _onUnmounted: CallBack[] = [];
}
let currentInstance: VueLiteHTMLElement | null = null;

export function defineComponent<P>(
  name: string,
  propDefs: any[],
  factory: (props: P) => () => TemplateResult
) {
  customElements.define(
    name,
    class extends VueLiteHTMLElement {
      static get observedAttributes() {
        return propDefs;
      }

      constructor() {
        super();
        const props = this._props;
        currentInstance = this;
        const template = factory.call(this, (props as unknown) as P);
        currentInstance = null;
        this._onBeforeMount && this._onBeforeMount.forEach((cb) => cb());
        const root = this.attachShadow({ mode: "closed" });
        let isMounted = false;
        effect(() => {
          if (!isMounted) {
            this._onBeforeUpdate && this._onBeforeUpdate.forEach((cb) => cb());
          }
          render(template(), root);
          if (isMounted) {
            this._onUpdated && this._onUpdated.forEach((cb) => cb());
          } else {
            isMounted = true;
          }
        });
      }
      connectedCallback() {
        this._onMounted && this._onMounted.forEach((cb) => cb());
      }
      disconnectedCallback() {
        this._onUnmounted && this._onUnmounted.forEach((cb) => cb());
      }
    }
  );
}

function createLifecycleMethod(
  name: Exclude<keyof VueLiteHTMLElement, keyof HTMLElement | "_props">
) {
  return (cb: () => void) => {
    if (currentInstance) {
      (currentInstance[name] || (currentInstance[name] = [])).push(cb);
    }
  };
}

export const getInstance = () => {
  return currentInstance;
};

export const onBeforeMount = createLifecycleMethod("_onBeforeMount");
export const onMounted = createLifecycleMethod("_onMounted");
export const onBeforeUpdate = createLifecycleMethod("_onBeforeUpdate");
export const onUpdated = createLifecycleMethod("_onUpdated");
export const onUnmounted = createLifecycleMethod("_onUnmounted");
