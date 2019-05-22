define(['app/utils/events', 'app/services/playerDatabase'], function(EventsEmitter, database) {
    class Roster {
        constructor(platform, eventBus) {
            this.state = -1;
            this.lobby = [];
            this.dead = [];

            this.players = {
                unknown: 0,
                dominated: 0,
                neutral: 0,
                rabbit: 0
            };
        }

        reset() {
            this.dead = [];
            this.lobby = [];
            this.players.unknown = 0;
            this.players.dominated = 0;
            this.players.neutral = 0;
            this.players.rabbit = 0;
        }

        add(name) {
            if (this.state > -1) {
                let level = database.select(name);
                this.players[level]++;
                this.lobby.push({
                    name,
                    type: level,
                    alive: true
                });
            }
        }

        remove(name) {
            let item = this.lobby.find((n) => n.name === name);
            if (item) {
                this.players[item.type]--;
                let d = this.lobby.splice(this.lobby.indexOf(item), 1)[0];
                if (this.state > 0) {
                    d.alive = false;
                    this.dead.push(d);
                }
            }
        }

        setState(v) {
            this.state = v;
            if (v === -1) {
                this.reset();
            }
        }
    }

    return Roster;
});