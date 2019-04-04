define(function() {
    const REQUIRED_FEATURES = ['me', 'map', 'match'];

    const map = {
        init
    };

    return map;

    function init(events) {
        if (window.overwolf) {
            overwolf.games.events.onInfoUpdates2.addListener(function(info) {
                console.log('all info', info);
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
});