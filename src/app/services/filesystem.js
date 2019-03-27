define(function() {
    let plugin_promise = null;
    const APP_DATA = ':appdata:';

    init();

    return {
        APP_DATA,
        exists,
        read,
        write
    };

    function init() {
        plugin_promise = new Promise((resolve, reject) => {
            overwolf.extensions.current.getExtraObject('simple-io-plugin', (result) => {
                if (result.status === 'success') {
                    plugin = result.object;
                    resolve(result.object)
                } else {
                    reject();
                }
            });
        });

    }

    function exists(path) {
        return new Promise((resolve, reject) => {
            plugin_promise.then((plugin) => {
                path = preprocess_path(plugin, path);

                overwolf.io.fileExists(path, (result) => {
                    if (result.found) {
                        resolve();
                    } else {
                        reject();
                    }
                });
            });
        });
    }

    function read(path) {
        return new Promise((resolve, reject) => {
            plugin_promise.then((plugin) => {
                path = preprocess_path(plugin, path);

                overwolf.io.readFileContents(path, 'UTF8', (result) => {
                    if (result.status === 'success') {
                        resolve(result.content);
                    } else {
                        reject();
                    }
                });
            });
        });
    }

    function write(path, content) {
        return new Promise((resolve, reject) => {
            plugin_promise.then((plugin) => {
                path = preprocess_path(plugin, path);

                overwolf.io.writeFileContents(path, content, 'UTF8', false, (result) => {
                    if (result.status === 'success') {
                        resolve();
                    } else {
                        reject();
                    }
                });
            });
        });
    }

    function preprocess_path(plugin, path) {
        return path.replace(APP_DATA, `${plugin.LOCALAPPDATA}/pubg.headhunt`);
    }
});