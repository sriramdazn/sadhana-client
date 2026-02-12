type Listener = () => void;

const listeners = new Set<Listener>();

export function emitAuthChanged() {
  listeners.forEach((fn) => fn());
}

export function onAuthChanged(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
