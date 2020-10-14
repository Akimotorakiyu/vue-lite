/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const e = new WeakMap(),
  t = (t) => "function" == typeof t && e.has(t),
  n =
    "undefined" != typeof window &&
    null != window.customElements &&
    void 0 !== window.customElements.polyfillWrapFlushCallback,
  s = (e, t, n = null) => {
    for (; t !== n; ) {
      const n = t.nextSibling;
      e.removeChild(t), (t = n);
    }
  },
  i = {},
  o = {},
  r = `{{lit-${String(Math.random()).slice(2)}}}`,
  l = `\x3c!--${r}--\x3e`,
  a = new RegExp(`${r}|${l}`);
class c {
  constructor(e, t) {
    (this.parts = []), (this.element = t);
    const n = [],
      s = [],
      i = document.createTreeWalker(t.content, 133, null, !1);
    let o = 0,
      l = -1,
      c = 0;
    const {
      strings: h,
      values: { length: g },
    } = e;
    for (; c < g; ) {
      const e = i.nextNode();
      if (null !== e) {
        if ((l++, 1 === e.nodeType)) {
          if (e.hasAttributes()) {
            const t = e.attributes,
              { length: n } = t;
            let s = 0;
            for (let e = 0; e < n; e++) u(t[e].name, "$lit$") && s++;
            for (; s-- > 0; ) {
              const t = h[c],
                n = p.exec(t)[2],
                s = n.toLowerCase() + "$lit$",
                i = e.getAttribute(s);
              e.removeAttribute(s);
              const o = i.split(a);
              this.parts.push({
                type: "attribute",
                index: l,
                name: n,
                strings: o,
              }),
                (c += o.length - 1);
            }
          }
          "TEMPLATE" === e.tagName && (s.push(e), (i.currentNode = e.content));
        } else if (3 === e.nodeType) {
          const t = e.data;
          if (t.indexOf(r) >= 0) {
            const s = e.parentNode,
              i = t.split(a),
              o = i.length - 1;
            for (let t = 0; t < o; t++) {
              let n,
                o = i[t];
              if ("" === o) n = d();
              else {
                const e = p.exec(o);
                null !== e &&
                  u(e[2], "$lit$") &&
                  (o =
                    o.slice(0, e.index) +
                    e[1] +
                    e[2].slice(0, -"$lit$".length) +
                    e[3]),
                  (n = document.createTextNode(o));
              }
              s.insertBefore(n, e),
                this.parts.push({ type: "node", index: ++l });
            }
            "" === i[o] ? (s.insertBefore(d(), e), n.push(e)) : (e.data = i[o]),
              (c += o);
          }
        } else if (8 === e.nodeType)
          if (e.data === r) {
            const t = e.parentNode;
            (null !== e.previousSibling && l !== o) ||
              (l++, t.insertBefore(d(), e)),
              (o = l),
              this.parts.push({ type: "node", index: l }),
              null === e.nextSibling ? (e.data = "") : (n.push(e), l--),
              c++;
          } else {
            let t = -1;
            for (; -1 !== (t = e.data.indexOf(r, t + 1)); )
              this.parts.push({ type: "node", index: -1 }), c++;
          }
      } else i.currentNode = s.pop();
    }
    for (const e of n) e.parentNode.removeChild(e);
  }
}
const u = (e, t) => {
    const n = e.length - t.length;
    return n >= 0 && e.slice(n) === t;
  },
  h = (e) => -1 !== e.index,
  d = () => document.createComment(""),
  p = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
class g {
  constructor(e, t, n) {
    (this.__parts = []),
      (this.template = e),
      (this.processor = t),
      (this.options = n);
  }
  update(e) {
    let t = 0;
    for (const n of this.__parts) void 0 !== n && n.setValue(e[t]), t++;
    for (const e of this.__parts) void 0 !== e && e.commit();
  }
  _clone() {
    const e = n
        ? this.template.element.content.cloneNode(!0)
        : document.importNode(this.template.element.content, !0),
      t = [],
      s = this.template.parts,
      i = document.createTreeWalker(e, 133, null, !1);
    let o,
      r = 0,
      l = 0,
      a = i.nextNode();
    for (; r < s.length; )
      if (((o = s[r]), h(o))) {
        for (; l < o.index; )
          l++,
            "TEMPLATE" === a.nodeName &&
              (t.push(a), (i.currentNode = a.content)),
            null === (a = i.nextNode()) &&
              ((i.currentNode = t.pop()), (a = i.nextNode()));
        if ("node" === o.type) {
          const e = this.processor.handleTextExpression(this.options);
          e.insertAfterNode(a.previousSibling), this.__parts.push(e);
        } else
          this.__parts.push(
            ...this.processor.handleAttributeExpressions(
              a,
              o.name,
              o.strings,
              this.options
            )
          );
        r++;
      } else this.__parts.push(void 0), r++;
    return n && (document.adoptNode(e), customElements.upgrade(e)), e;
  }
}
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */ const f =
    window.trustedTypes &&
    trustedTypes.createPolicy("lit-html", { createHTML: (e) => e }),
  m = ` ${r} `;
class v {
  constructor(e, t, n, s) {
    (this.strings = e),
      (this.values = t),
      (this.type = n),
      (this.processor = s);
  }
  getHTML() {
    const e = this.strings.length - 1;
    let t = "",
      n = !1;
    for (let s = 0; s < e; s++) {
      const e = this.strings[s],
        i = e.lastIndexOf("\x3c!--");
      n = (i > -1 || n) && -1 === e.indexOf("--\x3e", i + 1);
      const o = p.exec(e);
      t +=
        null === o
          ? e + (n ? m : l)
          : e.substr(0, o.index) + o[1] + o[2] + "$lit$" + o[3] + r;
    }
    return (t += this.strings[e]), t;
  }
  getTemplateElement() {
    const e = document.createElement("template");
    let t = this.getHTML();
    return void 0 !== f && (t = f.createHTML(t)), (e.innerHTML = t), e;
  }
}
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */ const _ = (e) =>
    null === e || !("object" == typeof e || "function" == typeof e),
  y = (e) => Array.isArray(e) || !(!e || !e[Symbol.iterator]);
class x {
  constructor(e, t, n) {
    (this.dirty = !0),
      (this.element = e),
      (this.name = t),
      (this.strings = n),
      (this.parts = []);
    for (let e = 0; e < n.length - 1; e++) this.parts[e] = this._createPart();
  }
  _createPart() {
    return new w(this);
  }
  _getValue() {
    const e = this.strings,
      t = e.length - 1,
      n = this.parts;
    if (1 === t && "" === e[0] && "" === e[1]) {
      const e = n[0].value;
      if ("symbol" == typeof e) return String(e);
      if ("string" == typeof e || !y(e)) return e;
    }
    let s = "";
    for (let i = 0; i < t; i++) {
      s += e[i];
      const t = n[i];
      if (void 0 !== t) {
        const e = t.value;
        if (_(e) || !y(e)) s += "string" == typeof e ? e : String(e);
        else for (const t of e) s += "string" == typeof t ? t : String(t);
      }
    }
    return (s += e[t]), s;
  }
  commit() {
    this.dirty &&
      ((this.dirty = !1),
      this.element.setAttribute(this.name, this._getValue()));
  }
}
class w {
  constructor(e) {
    (this.value = void 0), (this.committer = e);
  }
  setValue(e) {
    e === i ||
      (_(e) && e === this.value) ||
      ((this.value = e), t(e) || (this.committer.dirty = !0));
  }
  commit() {
    for (; t(this.value); ) {
      const e = this.value;
      (this.value = i), e(this);
    }
    this.value !== i && this.committer.commit();
  }
}
class b {
  constructor(e) {
    (this.value = void 0), (this.__pendingValue = void 0), (this.options = e);
  }
  appendInto(e) {
    (this.startNode = e.appendChild(d())), (this.endNode = e.appendChild(d()));
  }
  insertAfterNode(e) {
    (this.startNode = e), (this.endNode = e.nextSibling);
  }
  appendIntoPart(e) {
    e.__insert((this.startNode = d())), e.__insert((this.endNode = d()));
  }
  insertAfterPart(e) {
    e.__insert((this.startNode = d())),
      (this.endNode = e.endNode),
      (e.endNode = this.startNode);
  }
  setValue(e) {
    this.__pendingValue = e;
  }
  commit() {
    if (null === this.startNode.parentNode) return;
    for (; t(this.__pendingValue); ) {
      const e = this.__pendingValue;
      (this.__pendingValue = i), e(this);
    }
    const e = this.__pendingValue;
    e !== i &&
      (_(e)
        ? e !== this.value && this.__commitText(e)
        : e instanceof v
        ? this.__commitTemplateResult(e)
        : e instanceof Node
        ? this.__commitNode(e)
        : y(e)
        ? this.__commitIterable(e)
        : e === o
        ? ((this.value = o), this.clear())
        : this.__commitText(e));
  }
  __insert(e) {
    this.endNode.parentNode.insertBefore(e, this.endNode);
  }
  __commitNode(e) {
    this.value !== e && (this.clear(), this.__insert(e), (this.value = e));
  }
  __commitText(e) {
    const t = this.startNode.nextSibling,
      n = "string" == typeof (e = null == e ? "" : e) ? e : String(e);
    t === this.endNode.previousSibling && 3 === t.nodeType
      ? (t.data = n)
      : this.__commitNode(document.createTextNode(n)),
      (this.value = e);
  }
  __commitTemplateResult(e) {
    const t = this.options.templateFactory(e);
    if (this.value instanceof g && this.value.template === t)
      this.value.update(e.values);
    else {
      const n = new g(t, e.processor, this.options),
        s = n._clone();
      n.update(e.values), this.__commitNode(s), (this.value = n);
    }
  }
  __commitIterable(e) {
    Array.isArray(this.value) || ((this.value = []), this.clear());
    const t = this.value;
    let n,
      s = 0;
    for (const i of e)
      (n = t[s]),
        void 0 === n &&
          ((n = new b(this.options)),
          t.push(n),
          0 === s ? n.appendIntoPart(this) : n.insertAfterPart(t[s - 1])),
        n.setValue(i),
        n.commit(),
        s++;
    s < t.length && ((t.length = s), this.clear(n && n.endNode));
  }
  clear(e = this.startNode) {
    s(this.startNode.parentNode, e.nextSibling, this.endNode);
  }
}
class N {
  constructor(e, t, n) {
    if (
      ((this.value = void 0),
      (this.__pendingValue = void 0),
      2 !== n.length || "" !== n[0] || "" !== n[1])
    )
      throw new Error(
        "Boolean attributes can only contain a single expression"
      );
    (this.element = e), (this.name = t), (this.strings = n);
  }
  setValue(e) {
    this.__pendingValue = e;
  }
  commit() {
    for (; t(this.__pendingValue); ) {
      const e = this.__pendingValue;
      (this.__pendingValue = i), e(this);
    }
    if (this.__pendingValue === i) return;
    const e = !!this.__pendingValue;
    this.value !== e &&
      (e
        ? this.element.setAttribute(this.name, "")
        : this.element.removeAttribute(this.name),
      (this.value = e)),
      (this.__pendingValue = i);
  }
}
class E extends x {
  constructor(e, t, n) {
    super(e, t, n),
      (this.single = 2 === n.length && "" === n[0] && "" === n[1]);
  }
  _createPart() {
    return new V(this);
  }
  _getValue() {
    return this.single ? this.parts[0].value : super._getValue();
  }
  commit() {
    this.dirty &&
      ((this.dirty = !1), (this.element[this.name] = this._getValue()));
  }
}
class V extends w {}
let S = !1;
(() => {
  try {
    const e = {
      get capture() {
        return (S = !0), !1;
      },
    };
    window.addEventListener("test", e, e),
      window.removeEventListener("test", e, e);
  } catch (e) {}
})();
class T {
  constructor(e, t, n) {
    (this.value = void 0),
      (this.__pendingValue = void 0),
      (this.element = e),
      (this.eventName = t),
      (this.eventContext = n),
      (this.__boundHandleEvent = (e) => this.handleEvent(e));
  }
  setValue(e) {
    this.__pendingValue = e;
  }
  commit() {
    for (; t(this.__pendingValue); ) {
      const e = this.__pendingValue;
      (this.__pendingValue = i), e(this);
    }
    if (this.__pendingValue === i) return;
    const e = this.__pendingValue,
      n = this.value,
      s =
        null == e ||
        (null != n &&
          (e.capture !== n.capture ||
            e.once !== n.once ||
            e.passive !== n.passive)),
      o = null != e && (null == n || s);
    s &&
      this.element.removeEventListener(
        this.eventName,
        this.__boundHandleEvent,
        this.__options
      ),
      o &&
        ((this.__options = k(e)),
        this.element.addEventListener(
          this.eventName,
          this.__boundHandleEvent,
          this.__options
        )),
      (this.value = e),
      (this.__pendingValue = i);
  }
  handleEvent(e) {
    "function" == typeof this.value
      ? this.value.call(this.eventContext || this.element, e)
      : this.value.handleEvent(e);
  }
}
const k = (e) =>
  e &&
  (S ? { capture: e.capture, passive: e.passive, once: e.once } : e.capture);
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */ const M = new (class {
  handleAttributeExpressions(e, t, n, s) {
    const i = t[0];
    if ("." === i) {
      return new E(e, t.slice(1), n).parts;
    }
    if ("@" === i) return [new T(e, t.slice(1), s.eventContext)];
    if ("?" === i) return [new N(e, t.slice(1), n)];
    return new x(e, t, n).parts;
  }
  handleTextExpression(e) {
    return new b(e);
  }
})();
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */ function $(e) {
  let t = A.get(e.type);
  void 0 === t &&
    ((t = { stringsArray: new WeakMap(), keyString: new Map() }),
    A.set(e.type, t));
  let n = t.stringsArray.get(e.strings);
  if (void 0 !== n) return n;
  const s = e.strings.join(r);
  return (
    (n = t.keyString.get(s)),
    void 0 === n &&
      ((n = new c(e, e.getTemplateElement())), t.keyString.set(s, n)),
    t.stringsArray.set(e.strings, n),
    n
  );
}
const A = new Map(),
  P = new WeakMap();
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
"undefined" != typeof window &&
  (window.litHtmlVersions || (window.litHtmlVersions = [])).push("1.3.0");
const C = (e, ...t) => new v(e, t, "html", M),
  R = Symbol.for("reactiveObjectKey");
function I(e) {
  return null !== e && "object" == typeof e;
}
const L = new WeakMap();
let O;
const H = [];
let B = 0;
const j = new WeakMap();
function F(e, t, n, s) {
  const i = j.get(e),
    o = new Set();
  i.forEach((e, t) => {
    ("length" === t ||
      ((function (e) {
        return (
          String(parseInt(String(e))) === String(e) && "symbol" != typeof e
        );
      })(t) &&
        t >= n)) &&
      e.forEach((e) => {
        e !== O && o.add(e);
      });
  }),
    o.forEach((i) => {
      i.options.onTrigger &&
        i.options.onTrigger({
          effect: i,
          target: e,
          key: t,
          newValue: n,
          oldValue: s,
        }),
        i.options.scheduler ? i.options.scheduler(i) : i();
    });
}
function U(e, t, n, s) {
  j.get(e) &&
    ("length" === t && Array.isArray(e)
      ? F(e, t, parseInt(String(n)), s)
      : (function (e, t, n, s) {
          const i = j.get(e).get(t);
          if (!i) return;
          const o = new Set();
          i.forEach((e) => {
            e !== O && o.add(e);
          }),
            o.forEach((i) => {
              i.options.onTrigger &&
                i.options.onTrigger({
                  effect: i,
                  target: e,
                  key: t,
                  newValue: n,
                  oldValue: s,
                }),
                i.options.scheduler ? i.options.scheduler(i) : i();
            });
        })(e, t, n, s));
}
function W(e, t) {
  if (!O) return;
  let n = j.get(e);
  n || j.set(e, (n = new Map()));
  let s = n.get(t);
  s || n.set(t, (s = new Set())),
    s.has(O) ||
      (s.add(O),
      O.relayedInDependencies.push(s),
      O.options.onTrack && O.options.onTrack({ effect: O, target: e, key: t }));
}
function z(e, t = {}) {
  const n = Object.assign(
    function (...s) {
      if (!n.active) return t.scheduler ? void 0 : e(...s);
      if (!H.includes(n)) {
        !(function (e) {
          const { relayedInDependencies: t } = e;
          t.forEach((t) => {
            t.delete(e);
          }),
            (e.relayedInDependencies = []);
        })(n);
        try {
          return H.push(n), (O = n), e(...s);
        } finally {
          H.pop(), (O = H[H.length - 1]);
        }
      }
    },
    {
      id: B++,
      _isEffect: !0,
      active: !0,
      relayedInDependencies: [],
      rawFunction: e,
      options: t,
    }
  );
  return n;
}
const D = new Map();
function K(e) {
  D.set(Reflect.getPrototypeOf(e.prototype), e);
}
function q(e) {
  if (!I(e))
    return console.warn("value cannot be made reactive: " + String(e)), e;
  if (
    (function (e) {
      return R in e;
    })(e)
  )
    return e[R];
  !(function (e) {
    var t;
    let n,
      s = Reflect.getPrototypeOf(e);
    for (; (n = null == (t = D.get(s)) ? void 0 : t.prototype), n; )
      Reflect.setPrototypeOf(e, n), (s = n);
  })(e);
  const t = new Proxy(e, {
    get(e, t, n) {
      const s = Reflect.get(e, t, n);
      return W(e, t), I(s) ? q(s) : s;
    },
    set(e, t, n, s) {
      const i = Reflect.get(e, t, s),
        o = Reflect.set(e, t, n, s);
      return U(e, t, n, i), o;
    },
    deleteProperty(e, t) {
      const n = Reflect.get(e, t),
        s = Reflect.deleteProperty(e, t);
      return U(e, t, void 0, n), s;
    },
    has(e, t) {
      const n = Reflect.has(e, t);
      return W(e, t), n;
    },
    ownKeys(e) {
      const t = Reflect.ownKeys(e);
      return (
        t.forEach((t) => {
          W(e, t);
        }),
        t
      );
    },
  });
  return (
    Object.defineProperty(e, Symbol.for("reactiveObjectKey"), {
      writable: !1,
      enumerable: !1,
      value: t,
    }),
    L.set(t, e),
    t
  );
}
class G extends Set {
  add(e) {
    return (
      super.add.call(L.get(this), e), U(this, "length", void 0, void 0), this
    );
  }
  values() {
    W(this, "length");
    const e = super.values.call(L.get(this)),
      t = {
        [Symbol.iterator]: () => t,
        next() {
          const t = e.next();
          return t.done
            ? t
            : I(t.value)
            ? { value: q(t.value), done: !1 }
            : { value: t.value, done: !1 };
        },
      };
    return t;
  }
  clear() {
    super.clear.call(L.get(this)), U(this, "length", void 0, void 0);
  }
  has(e) {
    return W(this, "length"), super.has.call(L.get(this), e);
  }
  forEach(e) {
    for (const t of this.values()) e(t, t, this);
  }
  keys() {
    W(this, "length");
    const e = super.keys.call(L.get(this)),
      t = {
        [Symbol.iterator]: () => t,
        next() {
          const t = e.next();
          return t.done
            ? t
            : I(t.value)
            ? { value: q(t.value), done: !1 }
            : { value: t.value, done: !1 };
        },
      };
    return t;
  }
  entries() {
    W(this, "length");
    const e = super.entries.call(L.get(this)),
      t = {
        [Symbol.iterator]: () => t,
        next() {
          const t = e.next();
          return t.done
            ? t
            : I(t.value)
            ? { value: q(t.value), done: !1 }
            : { value: t.value, done: !1 };
        },
      };
    return t;
  }
  delete(e) {
    return U(this, "length", void 0, void 0), super.delete.call(L.get(this), e);
  }
  get size() {
    return W(this, "length"), Reflect.get(Set.prototype, "size", L.get(this));
  }
}
class J extends Map {
  set(e, t) {
    return (
      super.set.call(L.get(this), e, t), U(this, "length", void 0, void 0), this
    );
  }
  values() {
    W(this, "length");
    const e = super.values.call(L.get(this)),
      t = {
        [Symbol.iterator]: () => t,
        next() {
          const t = e.next();
          return t.done
            ? t
            : I(t.value)
            ? { value: q(t.value), done: !1 }
            : { value: t.value, done: !1 };
        },
      };
    return t;
  }
  clear() {
    super.clear.call(L.get(this)), U(this, "length", void 0, void 0);
  }
  has(e) {
    return W(this, "length"), super.has.call(L.get(this), e);
  }
  forEach(e) {
    for (const t of this.entries()) e(t[1], t[0], this);
  }
  keys() {
    W(this, "length");
    const e = super.keys.call(L.get(this)),
      t = {
        [Symbol.iterator]: () => t,
        next() {
          const t = e.next();
          return t.done
            ? t
            : I(t.value)
            ? { value: q(t.value), done: !1 }
            : { value: t.value, done: !1 };
        },
      };
    return t;
  }
  entries() {
    W(this, "length");
    const e = super.entries.call(L.get(this)),
      t = {
        [Symbol.iterator]: () => t,
        next() {
          const t = e.next();
          return t.done
            ? t
            : I(t.value)
            ? { value: q(t.value), done: !1 }
            : { value: t.value, done: !1 };
        },
      };
    return t;
  }
  delete(e) {
    return U(this, "length", void 0, void 0), super.delete.call(L.get(this), e);
  }
  get size() {
    return W(this, "length"), Reflect.get(Map.prototype, "size", L.get(this));
  }
}
K(G), K(J);
class Q extends HTMLElement {
  constructor() {
    super(...arguments),
      (this._props = q({})),
      (this._onBeforeMount = []),
      (this._onMounted = []),
      (this._onBeforeUpdate = []),
      (this._onUpdated = []),
      (this._onUnmounted = []);
  }
}
let X = null;
function Y(e, t, n, i) {
  customElements.define(
    e,
    class extends Q {
      static get observedAttributes() {
        return Object.keys(t);
      }
      constructor() {
        super();
        const t = this._props;
        console.log(e, this), (X = this);
        const i = n.call(this, t);
        (X = null), this._onBeforeMount.forEach((e) => e());
        const o = this.attachShadow({ mode: "closed" });
        let r = !1;
        !(function (e, t = {}) {
          const n = z("_isEffect" in e ? e.rawFunction : e, t);
          t.lazy || n();
        })(() => {
          r && this._onBeforeUpdate.forEach((e) => e()),
            ((e, t, n) => {
              let i = P.get(t);
              void 0 === i &&
                (s(t, t.firstChild),
                P.set(t, (i = new b(Object.assign({ templateFactory: $ }, n)))),
                i.appendInto(t)),
                i.setValue(e),
                i.commit();
            })(i(), o),
            r ? this._onUpdated.forEach((e) => e()) : (r = !0);
        });
      }
      connectedCallback() {
        this._onMounted.forEach((e) => e());
      }
      disconnectedCallback() {
        this._onUnmounted.forEach((e) => e());
      }
      attributeChangedCallback(e, t, n) {
        this._props[e] = n;
      }
    },
    i
  );
}
function Z(e) {
  return (t) => {
    X && X[e].push(t);
  };
}
const ee = Z("_onMounted"),
  te = Z("_onUpdated"),
  ne = Z("_onUnmounted");
Y("my-component", [], () => {
  const e = q({ text: "hello", show: !0 }),
    t = () => {
      e.show = !e.show;
    },
    n = (t) => {
      const n = t.target;
      e.text = n.value;
    };
  return () => C`
    <button @click=${t}>toggle child</button>
    <p>${e.text} <input value=${e.text} @input=${n} /></p>
    ${e.show ? C`<my-child msg=${e.text}></my-child>` : ""}
  `;
}),
  Y("my-child", { msg: "" }, (e) => {
    const t = q({ count: 0 }),
      n = () => {
        t.count++;
      };
    return (
      ee(() => {
        console.log("child mounted");
      }),
      te(() => {
        console.log("child updated");
      }),
      ne(() => {
        console.log("child unmounted");
      }),
      () => C`
    <p>${e.msg}</p>
    <p>${t.count}</p>
    <button @click=${n}>increase</button>
  `
    );
  });
const se = document.createElement("my-component");
document.getElementById("app").appendChild(se);
console.log("greeting: runtime-core!");
