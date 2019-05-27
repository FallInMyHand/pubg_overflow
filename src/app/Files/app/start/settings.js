requirejs.config({
    baseUrl: '../libs',
    paths: {
        app: '../app',
        config: '../config'
    }
});

requirejs(['app/utils/events', 'app/controller/settings'], function(EventsEmitter, controller) {
    window.eventBus = new EventsEmitter('settings');
    controller.init(window.eventBus);
});