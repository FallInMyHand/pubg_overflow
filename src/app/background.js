requirejs.config({
    baseUrl: 'lib',
    paths: {
        app: '../../../app'
    }
});

requirejs(['app/controller/background'], function(controller) {
    controller.init();
});



