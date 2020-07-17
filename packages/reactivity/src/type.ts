// reactive原始对象上的特殊Key，用来访问Proxy后的reactive对象
export const reactiveObjectKey = Symbol.for("reactiveObjectKey");

export type ReactiveObject<T extends object> = T & {
  readonly [reactiveObjectKey]: ReactiveObject<T>;
};

// 数组索引类型
export type ArrayIndex = number;

// key类型 string | number | symbol
export type ProxyHandlerKey = Parameters<ProxyHandler<object>["get"]>[1];

export interface ReactiveEffectOptions<T, A extends []> {
  /**
   * 是否默认执行
   *
   * @type {boolean}
   * @memberof ReactiveEffectOptions
   */
  lazy?: boolean;
  scheduler?: (job: ReactiveEffect<T, A>) => void;
  /**
   * 生命周期函数，收集依赖时候触发
   *
   * @memberof ReactiveEffectOptions
   */
  onTrack?: (event: DebuggerEvent<T, A>) => void;
  /**
   * 生命周期函数，依赖响应时是触发
   *
   * @memberof ReactiveEffectOptions
   */
  onTrigger?: (event: DebuggerEvent<T, A>) => void;
  onStop?: () => void;
}

export interface ReactiveEffect<T, A extends []> {
  (...args: A | []): T;
  readonly _isEffect: true;
  readonly id: number;
  active: boolean;
  readonly rawFunction: () => T;
  relayedInDependencies: Dependencies[];
  readonly options: ReactiveEffectOptions<T, A>;
}

export type Dependencies = Set<ReactiveEffect<unknown, []>>;
export type KeyToDepMap = Map<ProxyHandlerKey, Dependencies>;

export interface DebuggerEvent<T, A extends []> {
  readonly effect: ReactiveEffect<T, A>;
  readonly target: object;
  readonly key: ProxyHandlerKey;
  readonly newValue?: unknown;
  readonly oldValue?: unknown;
}

export interface ComputedRef<T, A extends []> {
  readonly effect: ReactiveEffect<T, A>;
  value: T;
}

export interface Constructor<T> {
  new (): T;
}
