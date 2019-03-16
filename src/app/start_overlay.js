requirejs.config({
    baseUrl: 'lib',
    paths: {
        app: '../../../app'
    }
});

requirejs(['app/utils/events', 'app/controller/overlay'], function(EventsEmitter, controller) {
    window.eventBus = new EventsEmitter('overlay');
    controller.init(window.eventBus);
});