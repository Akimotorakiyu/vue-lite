export const welcome = "greeting: runtime-dom!";

const root = document.querySelector("#app");

/**
 * 两种Tag类型，一种是string，一种是组件
 */
type ComponentDesc = string | VueComponent;
interface VueComponent<T = unknown> {
  setup?(): T;
  render?(): VNode[];
}

// HTML tag
const tagSet = new Set(["span", "div", "button"]);

// component tag -> component
const components = new Map<string, VueComponent>();

function isComponent(tag: ComponentDesc): tag is VueComponent {
  return typeof tag !== null && typeof tag === "object" && !Array.isArray(tag);
}

class VNode {
  $el: Node;
  renderedNodes: VNode[];
  constructor(
    public tag: ComponentDesc,
    public props: Props,
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

class HTMLVNode extends VNode {
  tag: string;
}

class TagVNode extends HTMLVNode {
  tag: string;
  create() {
    this.$el = document.createElement(this.tag);

    // 添加事件
    Object.entries(this.props)
      .filter((prop) => {
        return prop[0].startsWith("on");
      })
      .forEach((prop) => {
        if (typeof prop[1] === "function") {
          this.$el.addEventListener(prop[0].slice(2).toLowerCase(), prop[1]);
        } else {
          console.error(`事件监听器的值须为函数${prop[0]} ${prop[0].slice(2)}`);
        }
      });
  }
  mount(parent: Node) {
    this.children?.forEach((ele) => {
      ele.mount(this.$el);
    });
    parent.appendChild(this.$el);
  }
}

class CommentVNode extends HTMLVNode {
  tag: string;
  create() {
    this.$el = document.createComment("Comment");
  }
  mount(parent: Node) {
    parent.appendChild(this.$el);
  }
}
class TextVNode extends HTMLVNode {
  tag: string;
  create() {
    this.$el = document.createTextNode(this.tag);
  }
  mount(parent: Node) {
    parent.appendChild(this.$el);
  }
}
class VueVNode extends VNode {
  tag: ComponentDesc;
  create() {
    let com =
      typeof this.tag === "string" ? components.get(this.tag) : this.tag;

    this.renderedNodes = com?.render() || [];
    this.$el = document.createDocumentFragment();
  }

  mount(parent: Node) {
    this.renderedNodes?.forEach((ele) => {
      ele.mount(this.$el);
    });
    parent.appendChild(this.$el);
  }
}

interface Props {
  [props: string]: string | (() => void);
}

enum PatchFlag {
  static,
  props,
}

function createElement(
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

function createTextElement(
  tag: ComponentDesc,
  props?: Props,
  children?: VNode[],
  patchFlag?: PatchFlag,
  dyProps?: string[]
): VNode {
  return new TextVNode(tag, props, children, patchFlag, dyProps);
}

const h = createElement;
const t = createTextElement;

const App: VueComponent = {
  render: () => {
    return [
      h("div", {}, [
        t("hello world"),
        h(
          "button",
          {
            onClick: () => {
              console.log("单击");
            },
            onDblclick: () => {
              console.log("双击");
            },
          },
          [t("我是按钮")]
        ),
      ]),
    ];
  },
};

class Vue {
  h = h;
  constructor(public vNode: VNode) {}
  mount(parent: Node) {
    this.vNode.mount(parent);
    return this;
  }
}

function createApp(AppRoot: ComponentDesc) {
  return new Vue(h(AppRoot));
}

const app = createApp(App).mount(root);

Reflect.set(window, "app", app);

console.log(app, JSON.stringify(app, undefined, 2));
