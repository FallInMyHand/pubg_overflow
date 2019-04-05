requirejs.config({
    baseUrl: 'lib',
    paths: {
        app: '../../../../app'
    }
});

requirejs(['app/utils/events'], function(EventsEmitter) {
    window.eventBus = new EventsEmitter('help');
});