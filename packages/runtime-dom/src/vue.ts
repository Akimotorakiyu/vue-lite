import { ComponentDesc, VNode } from "./type";

import { h } from "./util";

export class Vue {
  h = h;
  constructor(public vNode: VNode) {}
  mount(parent: Node) {
    this.vNode.mount(parent);
    return this;
  }
}

export function createApp(AppRoot: ComponentDesc) {
  return new Vue(
    h(AppRoot, {
      name: "vue-lite",
    })
  );
}
