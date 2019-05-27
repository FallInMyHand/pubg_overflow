requirejs.config({
    baseUrl: '../libs',
    paths: {
        app: '../app'
    }
});

requirejs(['app/controller/statistic'], function(controller) {
    controller.init();
});