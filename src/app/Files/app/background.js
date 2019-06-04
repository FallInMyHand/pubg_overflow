requirejs.config({
    baseUrl: '../libs',
    paths: {
        app: '../app',
        config: '../config'
    }
});

requirejs(['app/utils/events', 'app/controller/background'], function(EventsEmitter, controller) {
    window.eventBus = new EventsEmitter('background');
    window.eventBus.loaded = [];
    controller.init(window.eventBus);
});



