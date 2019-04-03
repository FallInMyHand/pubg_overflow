define(function() {
    const db = {
        players: {}
    };

    let settings = {};

    return {
        load,
        select
    };

    function reset() {
        db.players = {};
    }

    function load(data, s) {
        reset();
        settings = s;
        db.players = data.players;
    }

    function select(name) {
        if (db.players[name] === undefined) {
            return 'unknown';
        } else {
            let stat = db.players[name];

            if (stat.ks >= settings.ks_amount) {
                return 'rabbit';
            } else if (stat.ds >= settings.ds_amount) {
                return 'dominated';
            } else {
                return 'neutral';
            }
        }
    }
});