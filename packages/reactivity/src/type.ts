export type ArrayIndex = number;

export type ProxyHandlerKey = Parameters<ProxyHandler<object>["get"]>[1];

export type Dependencies = Set<ReactiveEffect>;
export type KeyToDepMap = Map<ProxyHandlerKey, Dependencies>;

export interface ReactiveEffect<T = any> {
  (...args: any[]): T;
  _isEffect: true;
  id: number;
  active: boolean;
  rawFunction: () => T;
  relayedInDependencies: Dependencies[];
  options: ReactiveEffectOptions;
}

const reactiveObjectKey = Symbol.for("reactiveObjectKey");

export type ReactiveObject<T extends object> = T & {
  [reactiveObjectKey]: ReactiveObject<T>;
};

export type DebuggerEvent = {
  effect: ReactiveEffect;
  target: object;
  key: ProxyHandlerKey;
  newValue?: any;
  oldValue?: any;
};

export interface ReactiveEffectOptions {
  lazy?: boolean;
  computed?: boolean;
  scheduler?: (job: ReactiveEffect) => void;
  onTrack?: (event: DebuggerEvent) => void;
  onTrigger?: (event: DebuggerEvent) => void;
  onStop?: () => void;
}

export interface ComputedRef<T> {
  effect: ReactiveEffect<T>;
  value: T;
}
