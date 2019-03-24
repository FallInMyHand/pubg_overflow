requirejs.config({
    baseUrl: 'lib',
    paths: {
        app: '../../../app'
    }
});

requirejs(['app/utils/events', 'app/controller/settings'], function(EventsEmitter, controller) {
    window.eventBus = new EventsEmitter('settings');
    controller.init(window.eventBus);
});