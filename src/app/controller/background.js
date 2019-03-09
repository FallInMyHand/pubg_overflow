define(function() {
    const items = ['unknown', 'dominated', 'neutral', 'rabbit'];

    const FEATURE_PHASE = 'phase';
    const FEATURE_ROSTER = 'roster';
    const FEATUR_KILL = 'kill';

    const REQUIRED_FEATURES = ['me', FEATURE_PHASE, 'map', FEATURE_ROSTER, FEATUR_KILL, 'match'];

    const REGISTER_RETRY_TIMEOUT = 10000;

    let overlay_window;

    let players = {
        unknown: [],
        dominated: [],
        neutral: [],
        rabbit: []
    };

    let _roster = {}; // to know names for exit as {}

    return {
        init
    };

    function init() {
        if (overwolf) {
            var _plugin = null;
            overwolf.extensions.current.getExtraObject("simple-io-plugin", (result) => {
                if (result.status === "success") {
                    _plugin = result.object;
                }

                console.log(result, _plugin);
            });

            overwolf.io.writeFileContents('./qwertyuiop.json', 'abcada', 'UTF8', false, (result) => {

            });
            overwolf.io.fileExists('/src/data/config.json', (result) => {
                console.log('file - exist', result);
                if (!result.found) {
                    require(['app/controller/installation'], (installation) => {
                        installation.install();
                    });
                }
            });

            overwolf.windows.obtainDeclaredWindow('overlay', function(event) {
                overwolf.windows.restore('overlay', function(result) {
                    if (result.status === 'success') {
                        overwolf.windows.getOpenWindows((obj) => {
                            overlay_window = obj.overlay;
                            overwolf.windows.hide('overlay');
                        });
                    }
                })
            });
            overwolf.games.events.onInfoUpdates2.addListener(function(info) {
                console.log('info update', info);
                if (info.feature === FEATURE_PHASE) {
                    if (info.info.game_info.phase === 'loading_screen') {
                        overwolf.windows.restore('overlay');
                    }

                } else if (info.feature === FEATURE_ROSTER) {
                    let match_info = info.info.match_info;
                    Object.keys(match_info).forEach((k) => {
                        if (match_info[k] === '{}') {
                            if (_roster[k]) {
                                removePlayer(_roster[k]);
                                delete _roster[k];
                            }
                        } else {
                            let o = JSON.parse(match_info[k]);
                            if (!o.out) {
                                addPlayer(o.player);
                                _roster[k] = o.player;
                            } else {
                                removePlayer(o.player);
                                if (_roster[k]) {
                                    delete _roster[k];
                                }
                            }
                        }
                    });

                    if (overlay_window) {
                        overlay_window.update({
                            unknown: players.unknown.length,
                            dominated: players.dominated.length,
                            neutral: players.neutral.length,
                            rabbit: players.rabbit.length
                        });
                    }

                } else if (info.feature === FEATUR_KILL) {

                }
            })
            subscribeToEvents();
        }
    }

    function subscribeToEvents() {
        overwolf.games.events.setRequiredFeatures(REQUIRED_FEATURES, function(response) {
            if (response.status === 'error') {
                setTimeout(subscribeToEvents, REGISTER_RETRY_TIMEOUT);
            } else if (response.status === 'success') {
                console.log('connected');
                overwolf.games.events.onNewEvents.removeListener(_handleGameEvent);
                overwolf.games.events.onNewEvents.addListener(_handleGameEvent);
            }
          });
    }

    function _handleGameEvent(eventsInfo) {
        // matchStart
        console.log(eventsInfo);
        eventsInfo.events.forEach((event) => {
            if (event.name === 'matchEnd') {
                overwolf.windows.hide('overlay');

                players = {
                    unknown: [],
                    dominated: [],
                    neutral: [],
                    rabbit: []
                };
                _roster = {};
            } else {
                console.log('another - event', event);
            }
        });
    }

    function predictPlayerLevel(name) {
        return 'unknown';
    }

    function addPlayer(name) {
        let level = predictPlayerLevel(name);
        players[level].push(name);
    }

    function removePlayer(name) {
        items.forEach((k) => {
            let i = players[k].indexOf(name);
            if (i > -1) {
                players[k].splice(i, 1);

                return false;
            }
        });
    }
});