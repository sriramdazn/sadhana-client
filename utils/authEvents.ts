type Listener = () => void;

const listeners = new Set<Listener>();

export function onAuthChanged(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitAuthChanged() {
  listeners.forEach((l) => l());
}
