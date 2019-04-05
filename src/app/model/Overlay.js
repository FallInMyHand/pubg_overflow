define(function() {
    class Overlay {
        constructor(platform, events) {
            this.platform = platform;
            this._status = true;
            this._current_visible = false;
            this._in_match = true;

            events.on('startingMatch', () => {
                this._in_match = true;
                if (this._status && !this._current_visible) {
                    this.show().then(() => {
                        this._current_visible = true;
                    });
                }
            });
            events.on('matchEnd', () => {
                this._in_match = false;
                if (this._current_visible) {
                    this.hide().then(() => {
                        this._current_visible = false;
                    })
                }
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
    }

    return Overlay;
});