define(['app/services/filesystem'], function(filesystem) {
    const items = ['unknown', 'dominated', 'neutral', 'rabbit'];

    const FEATURE_PHASE = 'phase';
    const FEATURE_ROSTER = 'roster';
    const FEATUR_KILL = 'kill';

    const REQUIRED_FEATURES = ['me', FEATURE_PHASE, 'map', FEATURE_ROSTER, FEATUR_KILL, 'match'];

    const REGISTER_RETRY_TIMEOUT = 10000;

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

    function init(events) {
        if (overwolf) {
            filesystem.exists(`${filesystem.APP_DATA}/config.json`).then(() => {
                filesystem.read(`${filesystem.APP_DATA}/config.json`).then((content) => {
                    let userConfig = JSON.parse(content);
                    if (!userConfig.pubg.accountId) {
                        require(['app/services/pubg'], (pubgapi) => {
                            (async function() {
                                let accountId = await pubgapi.getAccountId(userConfig.username);
                                console.log('account id', accountId)
                                userConfig.pubg.accountId = accountId;
                                filesystem.write(`${filesystem.APP_DATA}/config.json`, JSON.stringify(userConfig));
                            }) ();

                        });
                    } else {
                        require(['app/services/pubg'], (pubgapi) => {
                            (async function() {
                                let matches_ids = await pubgapi.test();
                                if (matches_ids.length > 0) {
                                    let asset = await pubgapi.getMatchAsset(matches_ids[0]);
                                    let telemetry = await pubgapi.getTelemetry(asset.attributes.URL);

                                    let n = 'FallInMyHand';
                                    let all = telemetry.filter(t => t._T === 'LogPlayerKill');
                                    let killed = all.filter(t => t.killer.name === n);
                                    let killedBy = all.filter(t => t.victim.name === n);
                                    console.log('k/d', killed, killedBy);
                                }
                            }) ();
                        });
                    }
                });
            }, () => {
                console.log('config not exist');
                require(['app/controller/installation'], (installation) => {
                    installation.install();
                });
            });

            overwolf.windows.obtainDeclaredWindow('overlay', function(event) {
                overwolf.windows.restore('overlay', function(result) {
                    if (result.status === 'success') {
                        overwolf.windows.getOpenWindows((obj) => {
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
                    events.trigger('updatedRoster', {
                        unknown: players.unknown.length,
                        dominated: players.dominated.length,
                        neutral: players.neutral.length,
                        rabbit: players.rabbit.length
                    });
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
            } else if (event.name === 'damage_dealt') {

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