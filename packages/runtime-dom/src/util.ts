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
): VueVNode<T, P>;

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
  let vNode: VNode;

  if (typeof tag === "string") {
    if (tagSet.has(tag)) {
      vNode = new TagVNode(tag, props, children, patchFlag, dyProps);
    } else if (components.has(tag)) {
      vNode = new VueVNode(tag, props, children, patchFlag, dyProps);
    } else if (tag) {
      console.error("未定义的组件，已渲染为文本组件");
      vNode = createTextElement(tag, props, children, patchFlag, dyProps);
    } else {
      vNode = new CommentVNode("", props, children, patchFlag, dyProps);
    }
  } else if (isComponent(tag)) {
    vNode = new VueVNode(tag, props, children, patchFlag, dyProps);
  } else {
    console.error(`无效的组件${tag}，已渲染为vue组件`);
    vNode = new VueVNode(tag, props, children, patchFlag, dyProps);
  }
  if (patchFlag) {
    currentBlock.push(vNode);
  }

  return vNode;
}

export function createTextElement(
  tag: string,
  props?: Props,
  children?: VNode[],
  patchFlag?: PatchFlag,
  dyProps?: string[]
): VNode {
  const vNode = new TextVNode(tag, props, children, patchFlag, dyProps);
  if (patchFlag) {
    currentBlock.push(vNode);
  }
  return vNode;
}

const blockStack: VNode[][] = [];
let currentBlock: VNode[] = null;

export function openBlock() {
  blockStack.push((currentBlock = []));
}

export function createBlock(...args: Parameters<typeof createElement>) {
  const vNode = createElement(...args);

  vNode.dynamicChildren = currentBlock;

  blockStack.pop();

  currentBlock = blockStack[blockStack.length - 1] || null;
  if (currentBlock) {
    currentBlock.push(vNode);
  }
  return vNode;
}

export const h = createElement;
export const t = createTextElement;
export const ob = openBlock;
export const cb = createBlock;
