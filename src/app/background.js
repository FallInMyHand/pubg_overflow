requirejs.config({
    baseUrl: 'lib',
    paths: {
        app: '../../../app'
    }
});

requirejs(['app/controller/background'], function(controller) {
    controller.init();

    overwolf.windows.obtainDeclaredWindow('overlay', function() {
        overwolf.windows.restore('overlay')
    });
});



