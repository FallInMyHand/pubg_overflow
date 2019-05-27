requirejs.config({
    baseUrl: '../libs',
    paths: {
        app: '../app'
    }
});

requirejs(['app/utils/events', 'app/controller/roster'], function(EventsEmitter, controller) {
    window.eventBus = new EventsEmitter('roster');
    controller.init(window.eventBus);
});