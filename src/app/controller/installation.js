define(['app/services/filesystem', 'json!config/defaults/config.json'], function(filesystem, def_config) {
    return {
        install
    };

    function install() {
        return new Promise((resolve, reject) => {
            (async function() {
                try {
                    await filesystem.write(`${filesystem.APP_DATA}/config.json`, JSON.stringify(def_config));

                    resolve();
                } catch(e) {
                    reject();
                }
            })();
        })
    }
});