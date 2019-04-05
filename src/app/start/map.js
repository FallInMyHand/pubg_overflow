requirejs.config({
    baseUrl: 'lib',
    paths: {
        app: '../../../../app'
    }
});

requirejs(['app/utils/events', 'app/controller/map'], function(EventsEmitter, controller) {
    window.eventBus = new EventsEmitter('roster');
    controller.init(window.eventBus);
});