interface Eventbus {
  listeners: Map<string, any>;
  namedListeners: Map<string, Map<string, Function>>;
  addListener: (key: string, handler: any) => void;
  addNamedListener: (key: string, name: string, handler: Function) => void;
  removeListener: (key: string, handler: any) => void;
  removeNamedListener: (key: string, name: string) => void;
  removeAllListener: (key: string) => void;
  emit: (key: string, payload?: any) => void;
  namedEmit: (key: string, name: string, payload: any) => void;
}
function Eventbus() {
  const eventbus: Eventbus = {
    listeners: new Map(),
    namedListeners: new Map(),
  } as Eventbus;
  eventbus.addListener = function (key, handler) {
    const self = this;
    self.listeners.has(key) || self.listeners.set(key, []);
    self.listeners.get(key).push(handler);
    return false;
  };
  eventbus.addNamedListener = function (key, name, handler) {
    const self = this;
    self.namedListeners.has(key) || self.namedListeners.set(key, new Map());
    self.namedListeners.get(key)?.set(name, handler);
    return false;
  };

  eventbus.removeListener = function (key, handler) {
    const self = this;
    const listeners = self.listeners.get(key);
    if (!listeners) {
      return;
    }
    let i = listeners.indexOf(handler);
    if (i >= 0) {
      listeners.splice(i, 1);
    }
  };
  eventbus.removeNamedListener = function (key, name) {
    const self = this;
    const listeners = self.namedListeners.get(key);
    if (!listeners) {
      return;
    }
    listeners.delete(name);
  };
  eventbus.removeAllListener = function (key) {
    const self = this;
    const listeners = self.listeners.get(key);
    if (!listeners) {
      return;
    }
    self.listeners.delete(key);
  };
  eventbus.removeNamedListener = function (key, name) {
    const self = this;
    const listeners = self.namedListeners.get(key);
    if (!listeners) {
      return;
    }
    listeners.delete(name);
  };
  eventbus.emit = function (key, payload) {
    // 获取事件列表中存储的事件
    const listeners = this.listeners.get(key);
    if (listeners && listeners.length) {
      listeners.forEach((handler: Function) => {
        handler(payload);
      });
    }
  };
  eventbus.namedEmit = function (key, name, payload) {
    // 获取事件列表中存储的事件
    const listeners = this.namedListeners.get(key);
    if (!listeners) {
      return;
    }
    if (name) {
      const handler = listeners.get(name);
      if (handler) {
        handler(payload);
      }
    } else {
      listeners.forEach((handler) => {
        handler(payload);
      });
    }
  };
  return eventbus;
}
export const eventbus = Eventbus();
