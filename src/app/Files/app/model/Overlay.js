define(['app/utils/events'], function(EventsEmitter) {
    class Overlay {
        constructor(platform, eventBus) {
            this.platform = platform;
            this.events = new EventsEmitter('OverlayModel');
            this._status = true;
            this._current_visible = false;
            this._in_match = false;
            this.stat = {
                total_damage_dealt: 0
            };

            eventBus.on('startingMatch', () => {
                this._in_match = true;
                if (this._status && !this._current_visible) {
                    this.show().then(() => {
                        this._current_visible = true;
                    });
                }
            });
            eventBus.on('matchEnd', () => {
                this._in_match = false;
                if (this._current_visible) {
                    this.hide().then(() => {
                        this._current_visible = false;
                    });
                }
                this.setStat('total_damage_dealt', 0);
            });
        }

        show() {
            return new Promise((resolve, reject) => {
                overwolf.windows.restore('overlay', (result) => {
                    if (result.status === 'success') {
                        this._current_visible = true;
                        resolve();
                    } else {
                        reject();
                    }
                });
            });
        }

        hide() {
            return new Promise((resolve, reject) => {
                overwolf.windows.hide('overlay', (result) => {
                    if (result.status === 'success') {
                        this._current_visible = false;
                        resolve();
                    } else {
                        reject();
                    }
                });
            });
        }

        toggle() {
            this._status = !this._status;
            if (this._status) {
                if (this._in_match && !this._current_visible) {
                    this.show();
                }
            } else {
                if (this._current_visible) {
                    this.hide();
                }
            }
        }

        setStat(key, value) {
            this.stat[key] = value;

            if (key === 'total_damage_dealt') {
                this.events.trigger('statChanged', {
                    key,
                    value: Math.floor(value)
                });
            }
        }
    }

    return Overlay;
});