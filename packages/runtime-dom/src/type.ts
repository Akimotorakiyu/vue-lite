export class VNode<T = unknown, P = unknown> {
  $el: Node;
  renderedNodes: VNode[];
  constructor(
    public tag: ComponentDesc<T, P>,
    public props: Props & P,
    public children: VNode[],
    public patchFlag: PatchFlag,
    public dyProps: string[]
  ) {
    this.create();
  }

  create() {
    console.error("you must override the create function");
  }

  mount(parent: Node) {
    console.error("you must override the mount function");
  }
}

/**
 * 两种Tag类型，一种是string，一种是组件
 */
export type ComponentDesc<T = unknown, P = unknown> =
  | string
  | VueComponent<T, P>;
export interface VueComponent<T = unknown, P = unknown> {
  props?: P;
  setup?<G extends P>(props: G): T;
  render?<F extends T, G extends P>(_ctx: F, props: G): VNode[];
}

export interface Props {
  [props: string]: string | (() => void);
}

export enum PatchFlag {
  static,
  props,
}
