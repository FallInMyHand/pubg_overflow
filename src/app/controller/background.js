define(['app/services/filesystem', 'app/utils/array', 'app/services/playerDatabase'], function(filesystem, arrayUtils, database) {
    const items = ['unknown', 'dominated', 'neutral', 'rabbit'];

    let userConfig = null,
        processedMatches = null,
        userStat = null;

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
        if (window.overwolf) {
            let startApplication = () => {
                const readFiles = [
                    filesystem.read(`${filesystem.APP_DATA}/processed.${userConfig.pubg.accountId}.json`),
                    filesystem.read(`${filesystem.APP_DATA}/stat.${userConfig.pubg.accountId}.json`)
                ];

                Promise.all(readFiles).then(values => {
                    processedMatches = JSON.parse(values[0]);
                    userStat = JSON.parse(values[1]);

                    require(['app/services/pubg'], (pubgapi) => {
                        (async function() {
                            let matches_ids = await pubgapi.getMatcheIds(userConfig.username);
                            matches_ids = matches_ids.filter((d) => { return !processedMatches.matches.find(v => v.id === d)});
                            console.log(matches_ids);
                            if (matches_ids.length > 0) {
                                let accId = userConfig.pubg.accountId;
                                let results = await arrayUtils.asyncForEach(matches_ids, (match_id) => {
                                    return new Promise(async (resolve, reject) => {
                                        let asset = await pubgapi.getMatchAsset(match_id);
                                        let telemetry = await pubgapi.getTelemetry(asset.attributes.URL);

                                        let all = telemetry.filter(t => t._T === 'LogPlayerKill');
                                        let steaks = [];

                                        let killed = all.filter(t => t.killer.accountId === accId);
                                        killed.forEach((kill_log) => {
                                            let n = kill_log.victim.name;
                                            if (!userStat.players[n]) {
                                                userStat.players[n] = empty_stat_log();
                                            }
                                            // check kill streak
                                            userStat.players[n].k++;
                                            userStat.players[n].ds = 0;
                                        });
                                        let killedBy = all.filter(t => t.victim.accountId === accId);
                                        killedBy.forEach((death_log) => {
                                            let n = death_log.killer.name;
                                            if (!userStat.players[n]) {
                                                userStat.players[n] = empty_stat_log();
                                            }
                                            // check death streak
                                            userStat.players[n].d++;
                                            userStat.players[n].ks = 0;
                                        });

                                        processedMatches.matches.push({
                                            id: match_id,
                                            datetime: (new Date()).getTime() / 1000
                                        });

                                        database.load(userStat);

                                        resolve(Math.random());
                                    });
                                });

                                console.log('going to write')
                                Promise.all([
                                    filesystem.write(`${filesystem.APP_DATA}/processed.${userConfig.pubg.accountId}.json`, JSON.stringify(processedMatches)),
                                    filesystem.write(`${filesystem.APP_DATA}/stat.${userConfig.pubg.accountId}.json`, JSON.stringify(userStat))
                                ], () => {
                                    console.log('finished', results);
                                });
                            }
                        }) ();
                    });
                });
            };
            filesystem.exists(`${filesystem.APP_DATA}/config.json`).then(() => {
                filesystem.read(`${filesystem.APP_DATA}/config.json`).then(content => {
                    userConfig = JSON.parse(content);

                    startApplication();
                });
            }, () => {
                require(['app/controller/installation'], (installation) => {
                    installation.install().then(function(user) {
                        userConfig = user;

                        startApplication();
                    });
                });
            });

            applyHotkeys();

            overwolf.windows.obtainDeclaredWindow('overlay', function(event) {
                overwolf.windows.restore('overlay', function(result) {
                    if (result.status === 'success') {
                        overwolf.windows.getOpenWindows((obj) => {
                            overwolf.windows.hide('overlay');
                        });
                    }
                });
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
                    console.log('trigger', 'updatedRoster');
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

    function addPlayer(name) {
        let level = database.select(name);
        console.log('select', level);
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

    function empty_stat_log() {
        return {
            k: 0,
            d: 0,
            ks: 0,
            ds: 0
        };
    }

    function applyHotkeys() {
        overwolf.settings.registerHotKey('toggle_roster', (arg) => {
            console.log('hokey toggle');
            if (arg.status == "success") {
                alert("This is my cool action!");
            }
        });

        overwolf.settings.registerHotKey('settings', (arg) => {
            console.log('hotkey settings')
            if (arg.status == "success") {
                alert("This is my cool action!");
            }
        });
    }
});