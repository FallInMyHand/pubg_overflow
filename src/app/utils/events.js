define(function() {
    class EventsEmitter {
        constructor(window_name) {
            this.window_name = window_name;
            this._handlers = [];
        }

        on(name, handler) {
            this._handlers.push({
                name: name,
                handler: handler
            });
        }

        off(name) {

        }

        trigger(name, data) {
            this._handlers.filter(h => h.name === name).forEach(h => {
                h.handler(data);
            });
        }
    }

    return EventsEmitter;
});