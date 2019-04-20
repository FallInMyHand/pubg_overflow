define(['d3'], function(d3) {
    const FEATURE_MAP = 'map';
    const REQUIRED_FEATURES = ['me', FEATURE_MAP, 'match'];

    let a = {
        "Desert_Main": "Miramar",
        "DihorOtok_Main": "Vikendi",
        "Erangel_Main": "Erangel",
        "Range_Main": "Camp Jackal",
        "Savage_Main": "Sanhok"
    };

    const map = {
        init
    };

    return map;

    function init(events) {
        if (window.overwolf) {
            let mainEventBus = overwolf.windows.getMainWindow().eventBus;
            mainEventBus.trigger('mapReady', {
                callback: (map) => {
                    initEvents(map);
                }
            });
        }
    }

    function loadMap(name) {
        console.log('loading map', name);
    }

    function initEvents(map) {
        let you = document.querySelector('#you');
        map.events.on('move', (event) => {
            console.log('moving', event.point);
            let x = Math.floor(event.point.x / 8),
                y = Math.floor(event.point.y / 8);

            you.style.top = `${y}px`;
            you.style.left = `${x}px`;
        })
    }
});