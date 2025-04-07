const listeners = {};

export const subscribe = (eventName, callback) => {
    if (!listeners[eventName]) listeners[eventName] = [];
    listeners[eventName].push(callback);
};

export const emit = (eventName, payload) => {
    if (!listeners[eventName]) return;
    listeners[eventName].forEach(callback => callback(payload));
};