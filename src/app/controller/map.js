define(function() {
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
            overwolf.games.events.onInfoUpdates2.addListener(function(info) {
                console.log('all info', info);
                if (info.feature === FEATURE_MAP) {

                }
            });

            attachOverwolfEvents();
        }
    }

    function attachOverwolfEvents() {
        overwolf.games.events.setRequiredFeatures(REQUIRED_FEATURES, function(response) {
            if (response.status === 'error') {
                setTimeout(attachOverwolfEvents, REGISTER_RETRY_TIMEOUT);
            } else if (response.status === 'success') {
                overwolf.games.events.onNewEvents.removeListener(_handleGameEvent);
                overwolf.games.events.onNewEvents.addListener(_handleGameEvent);
            }
        });

    }

    function _handleGameEvent(eventsInfo) {
        eventsInfo.events.forEach((event) => {
            console.log('another - event', event);
        });
    }

    function loadMap(name) {
        console.log('loading map', name);
    }
});