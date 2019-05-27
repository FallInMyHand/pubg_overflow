requirejs.config({
    baseUrl: '../lib',
    paths: {
        app: '../app'
    }
});

requirejs(['app/utils/events'], function(EventsEmitter) {
    window.eventBus = new EventsEmitter('help');
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initUI();
    } else {
        document.addEventListener('DOMContentLoaded', function(event) {
            initUI();
        });
    }

    function initUI() {
        let close = document.querySelector('#close');
        close.addEventListener('click', function(event) {
            overwolf.windows.close('help');
        });
    }
});