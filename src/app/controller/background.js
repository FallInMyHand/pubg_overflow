define(['app/services/filesystem', 'app/utils/array', 'app/services/playerDatabase', 'app/model/Overlay', 'app/model/Roster', 'app/model/Map'], function(filesystem, arrayUtils, database, Overlay, Roster, Map) {
    let userConfig = null,
        processedMatches = null,
        userStat = null;

    const FEATURE_ME = 'me';
    const FEATURE_PHASE = 'phase';
    const FEATURE_ROSTER = 'roster';
    const FEATURE_KILL = 'kill';
    const FEATURE_LOCATION = 'location';
    const FEATURE_MAP = 'map';

    const REQUIRED_FEATURES = [FEATURE_ME, FEATURE_PHASE, FEATURE_MAP, FEATURE_ROSTER, FEATURE_KILL, 'match', FEATURE_LOCATION];

    const REGISTER_RETRY_TIMEOUT = 10000;

    let replays_last_update = -1;
    let game_in_process = false,
        replays_in_process = false;

    let events = {};
    let _roster = {}; // to know names for exit as {}

    const windows = {
        overlay: true,
        roster: false,
        settings: false,
        map: false,
        help: false
    };

    let overlay, roster, map;

    let streaks = [];

    return {
        init
    };

    function init(evn) {
        events = evn;

        if (window.overwolf) {
            window._test = () => {
                console.log(map.points);
            };
            overlay = new Overlay(overwolf, events);
            roster = new Roster(overwolf, events);
            map = new Map(overwolf, events);

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
                            ds_amount: 2,
                            favorite: []
                        };
                    }

                    userConfig.settings.favorite = [{
                        name: 'Hailrake',
                        icon: 'https://steamuserimages-a.akamaihd.net/ugc/957461211380538862/51D6DE755BF6285BAE9DB34EEB31832EEFE4171D/'
                    }]

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
                overlay.show().then(() => {
                    setTimeout(() => {
                        events.trigger('initOverlay', {
                            overlay
                        });
                    }, 500);

                    overlay.hide();
                });
            });

            overwolf.games.events.onInfoUpdates2.addListener(function(info) {
                if (info.feature === FEATURE_PHASE) {
                    if (info.info.game_info.phase === 'loading_screen') {
                        roster.setState(0);
                        map.setState(0);
                        events.trigger('startingMatch', {
                            overlay
                        });
                    } else if (info.info.game_info.phase === 'freefly') {
                        roster.setState(1);
                        map.setState(1);
                    } else if (info.info.game_info.phase === 'lobby') {
                        roster.setState(-1);
                        map.setState(-1);
                        triggerUpdatedRoster();
                    } else if (info.info.game_info.phase === 'landed') {
                        map.setState(2);
                    }
                } else if (info.feature === FEATURE_ROSTER) {
                    let match_info = info.info.match_info;
                    Object.keys(match_info).forEach((k) => {
                        if (match_info[k] === '{}') {
                            if (_roster[k]) {
                                roster.remove(_roster[k]);
                                delete _roster[k];
                            }
                        } else {
                            let o = JSON.parse(match_info[k]);
                            if (!o.out) {
                                addPlayer(o.player);
                                _roster[k] = o.player;
                            } else {
                                roster.remove(o.player);
                                if (_roster[k]) {
                                    delete _roster[k];
                                }
                            }
                        }
                    });
                    triggerUpdatedRoster();
                } else if (info.feature === FEATURE_KILL) {
                    let match_info = info.info.match_info;
                    if (match_info.total_damage_dealt !== undefined) {
                        if (overlay) {
                            overlay.setStat('total_damage_dealt', parseFloat(match_info.total_damage_dealt));
                        }
                    }
                } else if (info.feature === FEATURE_LOCATION) {
                    map.moveTo(JSON.parse(info.info.game_info.location));
                    //console.log('location', info);
                } else if (info.feature === FEATURE_ME) {
                    //console.log('me', info); // inVehicle
                } else if (info.feature === FEATURE_MAP) {

                }
                //if (info.feature !== FEATURE_ROSTER)
                //console.log('all info', info);
            });
            attachOverwolfEvents();

            events.on('matchEnd', (event) => {
                if (!replays_in_process && !game_in_process && (getTime() - replays_last_update) > 7200) {
                    parseReplays();
                }
            });

            events.on('resetApp', () => {
                overwolf.windows.close('settings', (result) => {
                    if (result.status === 'success') {
                        resetAppData();
                        require(['app/controller/installation'], (installation) => {
                            installation.install().then(function(user) {
                                userConfig = user;

                                startApplication();
                            });
                        });
                    }
                });
            });

            events.on('overlayReady', (data) => {
                data.callback(overlay);
            });

            events.on('mapReady', (data) => {
                data.callback(map);
            });

            events.on('requestHelp', function() {
                overwolf.windows.obtainDeclaredWindow('help', function(event) {
                    if (event.status === 'success') {
                        overwolf.windows.restore('help', function(result) {
                            if (result.status === 'success') {
                                windows.help = true;
                                setTimeout(() => {
                                    eventBus.trigger('help');
                                }, 500);
                            }
                        });
                    }
                });
            });

            events.on('saveSettings', function(data) {
                userConfig.settings = data;
                filesystem.write(`${filesystem.APP_DATA}/config.json`, JSON.stringify(userConfig)).then(() => {
                    console.log('Setting changed');
                });
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
                streaks = [];
                if (matches_ids.length > 0) {
                    let accId = userConfig.pubg.accountId;
                    let results = await arrayUtils.asyncForEach(matches_ids.reverse(), (match_id) => {
                        return new Promise(async (resolve, reject) => {
                            let asset = await pubgapi.getMatchAsset(match_id);
                            let telemetry = await pubgapi.getTelemetry(asset.attributes.URL);

                            let all = telemetry.filter(t => t._T === 'LogPlayerKill');
                            let ks_amount = userConfig.settings.ks_amount,
                                ds_amount = userConfig.settings.ds_amount;

                            let killed = all.filter(t => t.killer.accountId === accId && t.victim.accountId !== accId);
                            killed.forEach((kill_log) => {
                                let n = kill_log.victim.name;
                                if (!userStat.players[n]) {
                                    userStat.players[n] = empty_stat_log();
                                }
                                userStat.players[n].k++;
                                userStat.players[n].ks++;
                                userStat.players[n].ds = 0;
                                if (userStat.players[n].ks >= ks_amount) {
                                    streaks.push([1, userStat.players[n].ks - ks_amount, n]);
                                }
                            });
                            let killedBy = all.filter(t => t.victim.accountId === accId && t.killer.accountId !== accId);
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

                            console.log('cur streak', streaks)

                            resolve(Math.random());
                        });
                    });

                    database.load(userStat, userConfig.settings);

                    Promise.all([
                        filesystem.write(`${filesystem.APP_DATA}/processed.${userConfig.pubg.accountId}.json`, JSON.stringify(processedMatches)),
                        filesystem.write(`${filesystem.APP_DATA}/stat.${userConfig.pubg.accountId}.json`, JSON.stringify(userStat))
                    ]).then(() => {
                        console.log('finished', results);

                        end();

                        console.log(results)

                        if (streaks.length > -1) {
                            console.log('streaks', streaks)
                            overwolf.windows.obtainDeclaredWindow('statistic', (result) => {
                                if (result.status === 'success') {
                                    overwolf.windows.restore('statistic', (result) => {
                                        setTimeout(() => {
                                            events.trigger('streaks', streaks);
                                        }, 500);
                                    });
                                }
                            });
                        }
                    });
                } else {
                    database.load(userStat, userConfig.settings);

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
        roster.add(name);
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
        overwolf.settings.registerHotKey('toggle_overlay', (arg) => {
            if (arg.status === 'success') {
                overlay.toggle();
            }
        });

        overwolf.settings.registerHotKey('toggle_roster', (arg) => {
            if (arg.status === 'success') {
                if (!windows.roster) {
                    overwolf.windows.obtainDeclaredWindow('roster', (result) => {
                        if (result.status === 'success') {
                            overwolf.windows.restore('roster', (r) => {
                                if (r.status === 'success') {
                                    windows.roster = true;
                                    setTimeout(() => {
                                        triggerUpdatedRoster();
                                    }, 500);
                                }
                            });
                        }
                    });
                } else {
                    overwolf.windows.close('roster', () => {
                        windows.roster = false;
                    });
                }
            }
        });

        overwolf.settings.registerHotKey('toggle_settings', (arg) => {
            if (arg.status === 'success') {
                if (!windows.settings) {
                    overwolf.windows.obtainDeclaredWindow('settings', function(event) {
                        overwolf.windows.restore('settings', function(result) {
                            if (result.status === 'success') {
                                windows.settings = true;
                                setTimeout(function() {
                                    if (userConfig) {
                                        overwolf.windows.changeSize('settings', 400, 600, () => {
                                            setTimeout(() => {
                                                eventBus.trigger('settings', userConfig);
                                            }, 500);
                                        });
                                    } else {
                                        overwolf.windows.changeSize('settings', 400, 200, () => {
                                            setTimeout(() => {
                                                eventBus.trigger('installation');
                                            }, 500);
                                        });
                                    }
                                }, 500);
                            }
                        });
                    });
                } else {
                    overwolf.windows.close('settings', () => {
                        windows.settings = false;
                    });
                }
            }
        });

        overwolf.settings.registerHotKey('toggle_map', (arg) => {
            if (arg.status === 'success') {
                if (!windows.map) {
                    overwolf.windows.obtainDeclaredWindow('map', function(event) {
                        overwolf.windows.restore('map', function(result) {
                            if (result.status === 'success') {
                                windows.map = true;
                                setTimeout(() => {
                                    eventBus.trigger('map', {
                                        map: map
                                    });
                                }, 500);
                            }
                        });
                    });
                } else {
                    overwolf.windows.close('map', () => {
                        windows.map = false;
                    });
                }
            }
        })
    }

    function triggerUpdatedRoster() {
        let a = roster.lobby.concat(roster.dead).sort(function(a, b) {
            let aa = a.name.toLowerCase(),
                bb = b.name.toLowerCase();

            if (aa < bb) { return -1; }
            if (aa > bb) { return 1; }

            return 0;
        });
        let favorite = [];
        let f_names = userConfig.settings.favorite.map(f => f.name);
        a.filter(item => f_names.indexOf(item.name) > -1).forEach(item => {
            let s = userConfig.settings.favorite.find(v => v.name === item.name);
            favorite.push({
                name: item.name,
                type: item.type,
                alive: item.name,
                icon: s.icon
            });
        });

        events.trigger('updatedRoster', {
            unknown: roster.players.unknown,
            dominated: roster.players.dominated,
            neutral: roster.players.neutral,
            rabbit: roster.players.rabbit,
            all: a,
            favorite: favorite,
            overlay
        });
    }

    function getTime() {
        return (new Date()).getTime();
    }

    function resetAppData() {
        userConfig = null;
        processedMatches = null;
        userStat = null;
    }
});