import { VueComponent, ComponentDesc, Props, VNode, PatchFlag } from "./type";
import {
  TagVNode,
  VueVNode,
  tagSet,
  components,
  CommentVNode,
  TextVNode,
} from "./VNode";
export function defineComponent<T, P>(vueComponent: VueComponent<T, P>) {
  return vueComponent;
}

export function isComponent(tag: ComponentDesc): tag is VueComponent {
  return typeof tag !== null && typeof tag === "object" && !Array.isArray(tag);
}

export function createElement<T, P>(
  tag: VueComponent<T, P>,
  props?: Props & P,
  children?: VNode[],
  patchFlag?: PatchFlag,
  dyProps?: string[]
): VNode;

export function createElement(
  tag: string,
  props?: Props,
  children?: VNode[],
  patchFlag?: PatchFlag,
  dyProps?: string[]
): VNode;

export function createElement(
  tag: ComponentDesc,
  props?: Props,
  children?: VNode[],
  patchFlag?: PatchFlag,
  dyProps?: string[]
): VNode {
  if (typeof tag === "string") {
    if (tagSet.has(tag)) {
      return new TagVNode(tag, props, children, patchFlag, dyProps);
    } else if (components.has(tag)) {
      return new VueVNode(tag, props, children, patchFlag, dyProps);
    } else if (tag) {
      console.error("未定义的组件，已渲染为文本组件");
      return createTextElement(tag, props, children, patchFlag, dyProps);
    } else {
      return new CommentVNode("", props, children, patchFlag, dyProps);
    }
  } else if (isComponent(tag)) {
    return new VueVNode(tag, props, children, patchFlag, dyProps);
  } else {
    console.error(`无效的组件${tag}，已渲染为vue组件`);
    return new VueVNode(tag, props, children, patchFlag, dyProps);
  }
}

export function createTextElement(
  tag: string,
  props?: Props,
  children?: VNode[],
  patchFlag?: PatchFlag,
  dyProps?: string[]
): VNode {
  return new TextVNode(tag, props, children, patchFlag, dyProps);
}

export const h = createElement;
export const t = createTextElement;
