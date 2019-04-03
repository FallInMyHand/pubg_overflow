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

    let replays_last_update = -1;
    let game_in_process = false,
        replays_in_process = false;

    let _dead = [];

    let players = {
        unknown: [],
        dominated: [],
        neutral: [],
        rabbit: []
    };

    let events = {};
    let _roster = {}; // to know names for exit as {}
    let _roster_shown = false;

    const streaks = [];

    return {
        init
    };

    function init(evn) {
        events = evn;
        window._showStreaks = () => { console.log(streaks); };
        if (window.overwolf) {
            let startApplication = () => {
                const readFiles = [
                    filesystem.read(`${filesystem.APP_DATA}/processed.${userConfig.pubg.accountId}.json`),
                    filesystem.read(`${filesystem.APP_DATA}/stat.${userConfig.pubg.accountId}.json`)
                ];

                Promise.all(readFiles).then(values => {
                    processedMatches = JSON.parse(values[0]);
                    userStat = JSON.parse(values[1]);

                    parseReplays();
                });
            };
            filesystem.exists(`${filesystem.APP_DATA}/config.json`).then(() => {
                filesystem.read(`${filesystem.APP_DATA}/config.json`).then(content => {
                    userConfig = JSON.parse(content);
                    if (!userConfig.settings) {
                        userConfig.settings = {
                            ks_amount: 2,
                            ds_amount: 2
                        };
                    }

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
                    triggerUpdatedRoster();
                } else if (info.feature === FEATUR_KILL) {
                    let match_info = info.info.match_info;
                    console.log('kill total damage', match_info.total_damage_dealt);
                    //console.log('info update', info);
                } else {
                    //console.log('info update', info);
                }
                console.log('all info', info);
            });
            attachOverwolfEvents();

            events.on('matchEnd', (event) => {
                if (!replays_in_process && !game_in_process && (getTime() - replays_last_update) > 7200) {
                    parseReplays();
                }
            });
        }
    }

    function parseReplays() {
        console.log('parse replays: start');
        replays_in_process = true;

        let end = () => {
            replays_in_process = false;
            replays_last_update = getTime();
            console.log('parse replays: end');
        };
        require(['app/services/pubg'], (pubgapi) => {
            (async function() {
                let matches_ids = await pubgapi.getMatcheIds(userConfig.username);
                matches_ids = matches_ids.filter((d) => { return !processedMatches.matches.find(v => v.id === d)});
                console.log(matches_ids);
                if (matches_ids.length > 0) {
                    let accId = userConfig.pubg.accountId;
                    let results = await arrayUtils.asyncForEach(matches_ids.reverse(), (match_id) => {
                        return new Promise(async (resolve, reject) => {
                            let asset = await pubgapi.getMatchAsset(match_id);
                            let telemetry = await pubgapi.getTelemetry(asset.attributes.URL);

                            let all = telemetry.filter(t => t._T === 'LogPlayerKill');
                            let ks_amount = userConfig.settings.ks_amount,
                                ds_amount = userConfig.settings.ds_amount;

                            let killed = all.filter(t => t.killer.accountId === accId);
                            killed.forEach((kill_log) => {
                                let n = kill_log.victim.name;
                                if (!userStat.players[n]) {
                                    userStat.players[n] = empty_stat_log();
                                }
                                userStat.players[n].k++;
                                userStat.players[n].ks++;
                                userStat.players[n].ds = 0;
                                if (userStat.players[n].ks >= ks_amount) {
                                    streaks.push([1, userStat.players[n].ks - ks_amount], n);
                                }
                            });
                            let killedBy = all.filter(t => t.victim.accountId === accId);
                            killedBy.forEach((death_log) => {
                                let n = death_log.killer.name;
                                if (!userStat.players[n]) {
                                    userStat.players[n] = empty_stat_log();
                                }
                                // check death streak
                                userStat.players[n].d++;
                                userStat.players[n].ds++;
                                userStat.players[n].ks = 0;

                                if (userStat.players[n].ds >= ds_amount) {
                                    streaks.push([-1, userStat.players[n].ds - ds_amount, n]);
                                }
                            });

                            processedMatches.matches.push({
                                id: match_id,
                                datetime: (new Date()).getTime() / 1000
                            });

                            database.load(userStat);

                            resolve(Math.random());
                        });
                    });

                    Promise.all([
                        filesystem.write(`${filesystem.APP_DATA}/processed.${userConfig.pubg.accountId}.json`, JSON.stringify(processedMatches)),
                        filesystem.write(`${filesystem.APP_DATA}/stat.${userConfig.pubg.accountId}.json`, JSON.stringify(userStat))
                    ], () => {
                        console.log('finished', results);

                        end();
                    });
                } else {
                    end();
                }
            }) ();
        });
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
            if (event.name === 'matchEnd') {
                game_in_process = false;
                overwolf.windows.hide('overlay');

                players = {
                    unknown: [],
                    dominated: [],
                    neutral: [],
                    rabbit: []
                };
                _dead = [];
                _roster = {};

                events.trigger('matchEnd');
            } else if (event.name === 'matchStart') {
                game_in_process = true;
            } else if (event.name === 'damage_dealt') {

            } else {
                console.log('another - event', event);
            }
        });
    }

    function addPlayer(name) {
        let level = database.select(name);
        players[level].push(name);
    }

    function removePlayer(name) {
        items.forEach((k) => {
            let i = players[k].indexOf(name);
            if (i > -1) {
                players[k].splice(i, 1);

                /*
                 if in game mark him as dead
                 _dead.push({ type: k, name: name });
                */

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
            if (arg.status == "success") {
                if (!_roster_shown) {
                    overwolf.windows.obtainDeclaredWindow('roster', (result) => {
                        if (result.status === 'success') {
                            overwolf.windows.restore('roster', (r) => {
                                if (r.status === 'success') {
                                    _roster_shown = true;
                                    setTimeout(() => {
                                        triggerUpdatedRoster();
                                    }, 500);
                                }
                            });
                        }
                    });
                } else {
                    overwolf.windows.close('roster', () => {
                        _roster_shown = false;
                    });
                }
            }
        });

        overwolf.settings.registerHotKey('settings', (arg) => {
            if (arg.status === 'success') {
                overwolf.windows.obtainDeclaredWindow('settings', function(event) {
                    overwolf.windows.restore('settings', function(result) {
                        if (result.status === 'success') {
                            overwolf.windows.changeSize('settings', 400, 700, () => {
                                setTimeout(function() {
                                    eventBus.trigger('settings');
                                }, 500);
                            });
                        }
                    });
                });
            }
        });
    }

    function triggerUpdatedRoster() {
        let all = [];
        players.unknown.forEach((n) => {
            all.push({
                type: 'unknown',
                name: n
            });
        });
        players.dominated.forEach((n) => {
            all.push({
                type: 'dominated',
                name: n
            });
        });
        players.neutral.forEach((n) => {
            all.push({
                type: 'neutral',
                name: n
            });
        });
        players.rabbit.forEach((n) => {
            all.push({
                type: 'rabbit',
                name: n
            });
        });

        events.trigger('updatedRoster', {
            unknown: players.unknown.length,
            dominated: players.dominated.length,
            neutral: players.neutral.length,
            rabbit: players.rabbit.length,
            all: all.sort(function(a, b) {
                if(a.name < b.name) { return -1; }
                if(a.name > b.name) { return 1; }
                return 0;
            })
        });
    }

    function getTime() {
        return (new Date()).getTime();
    }
});