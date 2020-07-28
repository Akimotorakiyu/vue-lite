import { doc } from "prettier";

export const welcome = "greeting: runtime-dom!";

const root = document.querySelector("#app");

interface VueComponentDesc {
  render(): VNode[];
}

const tagSet = new Set(["span", "div"]);

// component tag
const components = new Map<string, VueComponentDesc>();

function isComponent(tag: any): tag is VueComponentDesc {
  return typeof tag !== null && typeof tag === "object" && !Array.isArray(tag);
}

class VNode {
  $el: Node;
  renderedNodes: VNode[];
  constructor(
    public tag: string,
    public props: Props,
    public children: VNode[]
  ) {
    this.create();
  }

  create() {
    if (tagSet.has(this.tag)) {
      this.$el = document.createElement(this.tag);
    } else if (components.has(this.tag)) {
      const com = components.get(this.tag);
      this.renderedNodes = com.render();
      this.$el = document.createDocumentFragment();
    } else if (isComponent(this.tag)) {
      const com = this.tag;
      this.renderedNodes = com.render();
      this.$el = document.createDocumentFragment();
    } else if (!this.tag) {
      this.$el = document.createComment("");
    } else {
      this.$el = document.createTextNode(this.tag);
    }
  }

  mount(parent: Node) {
    parent.appendChild(this.$el);
    this.children?.forEach((ele) => {
      ele.mount(this.$el);
    });
  }
}

interface Props {
  [props: string]: string;
}

function createElement(tag: string, props?: Props, children?: VNode[]) {
  return new VNode(tag, props, children);
}

const app = createElement("span", {}, [createElement("hello world")]);

app.mount(root);
