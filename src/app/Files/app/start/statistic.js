requirejs.config({
    baseUrl: '../libs',
    paths: {
        app: '../app'
    }
});

requirejs(['app/utils/events', 'app/controller/statistic'], function(EventsEmitter, controller) {
    window.eventBus = new EventsEmitter('statistic');
    controller.init(window.eventBus);
});