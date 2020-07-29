import { ComponentDesc, VNode, VueComponent } from "./type";

import { h } from "./util";

export class Vue {
  h = h;
  constructor(public vNode: VNode) {}
  mount(parent: Node) {
    this.vNode.mount(parent);
    return this;
  }
}

export function createApp<T, P>(AppRoot: VNode) {
  return new Vue(AppRoot);
}
