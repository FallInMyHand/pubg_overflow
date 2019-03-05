requirejs.config({
    baseUrl: 'lib',
    paths: {
        app: '../../../app'
    }
});

requirejs(['app/controller/overlay'], function(controller) {
    controller.init();
});