define(function() {
    const map = {
        init
    };

    return map;

    function init(events) {
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
    }
});