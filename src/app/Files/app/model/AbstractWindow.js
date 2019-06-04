define(function(EventsEmitter) {
    class AbstractWindow {
        constructor(name, platform, events) {
            this.name = name;
            this.platform = platform;
            this.mainBus = events;

            this._is_open = false;
            this._visible = false;
        }

        isVisible() {
            return this._visible;
        }

        show() {
            return new Promise((resolve, reject) => {
                this.platform.windows.restore(this.name, (r) => {
                    if (r.status === 'success') {
                        this._visible = true;
                        if (!this.is_open) {
                            this.is_open = true;
                            let i = 0;
                            let f = () => {
                                try {
                                setTimeout(() => {
                                    if (this.mainBus.loaded.indexOf(this.name) > -1) {
                                        resolve();
                                    } else if (i > 15) {
                                        debugger
                                        reject();
                                    } else {
                                        i++;
                                        f();
                                    }
                                }, 150);

                                } catch(e) {
                                    console.log(e);
                                }
                            };
                            f();
                        } else {
                            resolve();
                        }
                    }
                });
            });
        }

        hide() {
            return new Promise((resolve, reject) => {
                this.platform.windows.hide(this.name, (result) => {
                    if (result.status === 'success') {
                        this._visible = false;
                        resolve();
                    } else {
                        reject();
                    }
                });
            });
        }

        close() {
            return new Promise((resolve, reject) => {
                this.platform.windows.close(this.name, () => {
                    this.is_open = false;
                    this._visible = false;
                    if (this.mainBus.loaded.indexOf(this.name) > -1) {
                        this.mainBus.loaded.splice(this.mainBus.loaded.indexOf(this.name), 1);
                    }
                    resolve();
                });
            });
        }
    }

    return AbstractWindow;
});