define(function() {
    let plugin_promise = null;
    const APP_DATA = ':appdata:';

    init();

    return {
        APP_DATA,
        exists,
        read,
        write,
        remove
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

    async function exists(path) {
        return new Promise(async (resolve, reject) => {
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

    async function read(path) {
        return new Promise(async (resolve, reject) => {
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

    async function write(path, content) {
        return new Promise(async (resolve, reject) => {
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

    async function remove(path) {
        // need implementation
    }

    function preprocess_path(plugin, path) {
        return path.replace(APP_DATA, `${plugin.LOCALAPPDATA}/pubg.headhunt`);
    }
});