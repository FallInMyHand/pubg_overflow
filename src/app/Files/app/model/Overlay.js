define(['app/utils/events', 'app/model/AbstractWindow'], function(EventsEmitter, AbstractWindow) {
    class Overlay extends AbstractWindow {
        constructor(platform, eventBus) {
            super('overlay', platform, eventBus);

            this.events = new EventsEmitter('OverlayModel');
            this._status = true;
            this._current_visible = false;
            this._in_match = false;
            this.stat = {
            };

            eventBus.on('startingMatch', () => {
                this._in_match = true;
                if (this._status && !this.isVisible()) {
                    this.show();
                }
            });
            eventBus.on('matchEnd', () => {
                this._in_match = false;
                if (this.isVisible()) {
                    this.hide();
                }
                // this.setStat('total_damage_dealt', 0);
            });
        }

        toggle() {
            this._status = !this._status;
            if (this._status) {
                if (this._in_match && !this.isVisible()) {
                    this.show();
                }
            } else {
                if (this.isVisible()) {
                    this.hide();
                }
            }
        }

        setStat(key, value) {
            this.stat[key] = value;

            /*
            if (key === 'total_damage_dealt') {
                this.events.trigger('statChanged', {
                    key,
                    value: Math.floor(value)
                });
            }
            */
        }
    }

    return Overlay;
});