requirejs.config({
    baseUrl: 'lib',
    paths: {
        app: '../../../app'
    }
});

requirejs(['app/controller/statistic'], function(controller) {
    controller.init();
});