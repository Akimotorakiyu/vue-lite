import { render } from "lit-html";
export { html, TemplateResult } from "lit-html";

import { effect, reactive } from "@vue-lite/reactivity";
export { reactive } from "@vue-lite/reactivity";

let currentInstance: HTMLElement = null;

export function defineComponent(name: string, propDefs: any[], factory) {
  customElements.define(
    name,
    class extends HTMLElement {
      static get observedAttributes() {
        return propDefs;
      }
      _props = reactive({});
      _bm = [];
      _bu = [];
      _u = [];
      _m = [];
      _um = [];

      constructor() {
        super();
        const props = this._props;
        currentInstance = this;
        const template = factory.call(this, props);
        currentInstance = null;
        this._bm && this._bm.forEach((cb) => cb());
        const root = this.attachShadow({ mode: "closed" });
        let isMounted = false;
        effect(() => {
          if (!isMounted) {
            this._bu && this._bu.forEach((cb) => cb());
          }
          render(template(), root);
          if (isMounted) {
            this._u && this._u.forEach((cb) => cb());
          } else {
            isMounted = true;
          }
        });
      }
      connectedCallback() {
        this._m && this._m.forEach((cb) => cb());
      }
      disconnectedCallback() {
        this._um && this._um.forEach((cb) => cb());
      }
      attributeChangedCallback(name, oldValue, newValue) {
        this._props[name] = newValue;
      }
    }
  );
}

function createLifecycleMethod(name: string) {
  return (cb: () => void) => {
    if (currentInstance) {
      (currentInstance[name] || (currentInstance[name] = [])).push(cb);
    }
  };
}

export const onBeforeMount = createLifecycleMethod("_bm");
export const onMounted = createLifecycleMethod("_m");
export const onBeforeUpdate = createLifecycleMethod("_bu");
export const onUpdated = createLifecycleMethod("_u");
export const onUnmounted = createLifecycleMethod("_um");
