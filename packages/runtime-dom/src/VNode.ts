import { VNode, ComponentDesc, VueComponent } from "./type";

// HTML tag
export const tagSet = new Set(["span", "div", "button"]);

// component tag -> component
export const components = new Map<string, VueComponent>();

export class HTMLVNode extends VNode {
  tag: string;
}

export class TagVNode extends HTMLVNode {
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

export class CommentVNode extends HTMLVNode {
  tag: string;
  create() {
    this.$el = document.createComment("Comment");
  }
  mount(parent: Node) {
    parent.appendChild(this.$el);
  }
}

export class TextVNode extends HTMLVNode {
  tag: string;
  create() {
    this.$el = document.createTextNode(this.tag);
  }
  mount(parent: Node) {
    parent.appendChild(this.$el);
  }
}

export class VueVNode extends VNode {
  tag: ComponentDesc;
  ctx;

  create() {
    let com =
      typeof this.tag === "string" ? components.get(this.tag) : this.tag;
    console.log("VueVNode props", this.props);
    this.ctx = com?.setup(this.props);
    console.log("VueVNode ctx", this.ctx);
    this.renderedNodes = com?.render(this.ctx, this.props) || [];
    this.$el = document.createDocumentFragment();
  }

  mount(parent: Node) {
    this.renderedNodes?.forEach((ele) => {
      ele.mount(this.$el);
    });
    parent.appendChild(this.$el);
  }
}
