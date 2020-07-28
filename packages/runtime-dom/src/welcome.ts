import { doc } from "prettier";

export const welcome = "greeting: runtime-dom!";

const root = document.querySelector("#app");

/**
 * 两种Tag类型，一种是原生tag，一种是vue组件
 */
type VueComponentDesc = string | VueComponent;
interface VueComponent {
  render(): VNode[];
}

const tagSet = new Set(["span", "div"]);

// component tag
const components = new Map<string, VueComponent>();

function isComponent(tag: any): tag is VueComponent {
  return typeof tag !== null && typeof tag === "object" && !Array.isArray(tag);
}

class VNode {
  $el: Node;
  renderedNodes: VNode[];
  constructor(
    public tag: VueComponentDesc,
    public props: Props,
    public children: VNode[]
  ) {
    this.create();
  }

  create() {
    if (typeof this.tag === "string") {
      if (tagSet.has(this.tag)) {
        this.$el = document.createElement(this.tag);
      } else if (components.has(this.tag)) {
        const com = components.get(this.tag);
        this.renderedNodes = com.render();
        this.$el = document.createDocumentFragment();
      } else if (!this.tag) {
        this.$el = document.createComment("");
      } else {
        this.$el = document.createTextNode(this.tag);
      }
    } else if (isComponent(this.tag)) {
      const com = this.tag;
      this.renderedNodes = com.render();
      this.$el = document.createDocumentFragment();
    }
  }

  mount(parent: Node) {
    if (this.renderedNodes) {
      this.renderedNodes.forEach((ele) => {
        ele.mount(this.$el);
      });
    } else {
      this.children?.forEach((ele) => {
        ele.mount(this.$el);
      });
    }
    parent.appendChild(this.$el);
  }
}

interface Props {
  [props: string]: string;
}

function createElement(
  tag: VueComponentDesc,
  props?: Props,
  children?: VNode[]
) {
  return new VNode(tag, props, children);
}

const App: VueComponent = {
  render: () => {
    return [createElement("div", {}, [createElement("hello world")])];
  },
};

function createApp(AppRoot: VueComponentDesc) {
  const appRoot = createElement(AppRoot);
  console.log(appRoot);
  return appRoot;
}

createApp(App).mount(root);
