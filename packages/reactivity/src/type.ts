export type ArrayIndex = number;

export type ProxyHandlerKey = Parameters<ProxyHandler<object>["get"]>[1];

export type Dependencies = Set<ReactiveEffect<unknown, []>>;
export type KeyToDepMap = Map<ProxyHandlerKey, Dependencies>;

export interface ReactiveEffect<T, A extends []> {
  (...args: A | []): T;
  _isEffect: true;
  id: number;
  active: boolean;
  rawFunction: () => T;
  relayedInDependencies: Dependencies[];
  options: ReactiveEffectOptions<T, A>;
}

const reactiveObjectKey = Symbol.for("reactiveObjectKey");

export type ReactiveObject<T extends object> = T & {
  [reactiveObjectKey]: ReactiveObject<T>;
};

export type DebuggerEvent<T, A extends []> = {
  effect: ReactiveEffect<T, A>;
  target: object;
  key: ProxyHandlerKey;
  newValue?: any;
  oldValue?: any;
};

export interface ReactiveEffectOptions<T, A extends []> {
  lazy?: boolean;
  computed?: boolean;
  scheduler?: (job: ReactiveEffect<T, A>) => void;
  onTrack?: (event: DebuggerEvent<T, A>) => void;
  onTrigger?: (event: DebuggerEvent<T, A>) => void;
  onStop?: () => void;
}

export interface ComputedRef<T, A extends []> {
  effect: ReactiveEffect<T, A>;
  value: T;
}
