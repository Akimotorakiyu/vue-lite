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

export type DebuggerEvent = {
  effect: ReactiveEffect;
  target: object;
  key: any;
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
