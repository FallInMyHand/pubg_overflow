define(function() {
    const FEATURE_PHASE = 'phase';

    const REQUIRED_FEATURES = ['me', FEATURE_PHASE, 'map', 'roster', 'kill', 'match'];

    const REGISTER_RETRY_TIMEOUT = 10000;

    return {
        init
    };

    function init() {
        overwolf.games.events.onInfoUpdates2.addListener(function(info) {
            console.log('info update', info);
            if (info.feature === FEATURE_PHASE) {

            }
        })
        subscribeToEvents();
    }

    function subscribeToEvents() {
        overwolf.games.events.setRequiredFeatures(REQUIRED_FEATURES, function(response) {
            if (response.status === 'error') {
                setTimeout(subscribeToEvents, REGISTER_RETRY_TIMEOUT);
            } else if (response.status === 'success') {
                console.log('connected');
                overwolf.games.events.onNewEvents.removeListener(_handleGameEvent);
                overwolf.games.events.onNewEvents.addListener(_handleGameEvent);


                overwolf.windows.obtainDeclaredWindow('overlay', (x) => {
                    if (x.status === 'success') {
                        overwolf.windows.restore(x.window.id);
                    }
                });
            }
          });
    }

    async function _handleGameEvent(eventsInfo) {
        // matchStart
        console.log(eventsInfo);
        eventsInfo.events.forEach((event) => {
            if (event.name === 'matchEnd') {

            } else {
                console.log('another - event', event);
            }
        });
    }
});