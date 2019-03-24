define(['app/services/filesystem', 'json!config/defaults/config.json', 'json!config/defaults/processed.json', 'json!config/defaults/stat.json'], function(filesystem, def_config, def_processed, def_stat) {
    return {
        install
    };

    function install() {
        return new Promise((resolve, reject) => {
            (async function() {
                try {
                    overwolf.windows.obtainDeclaredWindow('settings', function(event) {
                        overwolf.windows.restore('settings', function(result) {
                            if (result.status === 'success') {
                                let eventBus = overwolf.windows.getMainWindow().eventBus;
                                eventBus.off('obtaintUserData');
                                eventBus.on('obtaintUserData', function(data) {
                                    let promises = [];

                                    /* Inizialize files */

                                    // config
                                    let userData = JSON.parse(JSON.stringify(def_config));
                                    userData.username = data.username;
                                    userData.pubg.accountId = data.accountId;
                                    promises.push(filesystem.write(`${filesystem.APP_DATA}/config.json`, JSON.stringify(userData)));

                                    // processed
                                    let userProcessed = JSON.parse(JSON.stringify(def_processed));
                                    userProcessed.accountId = data.accountId;
                                    promises.push(filesystem.write(`${filesystem.APP_DATA}/processed.${data.accountId}.json`, JSON.stringify(userProcessed)));

                                    // stat
                                    let userStat = JSON.parse(JSON.stringify(def_stat));
                                    userStat.accoutId = data.account;
                                    promises.push(filesystem.write(`${filesystem.APP_DATA}/stat.${data.accountId}.json`, JSON.stringify(userStat)));

                                    Promise.all(promises).then(() => {
                                        resolve(userData);

                                        setTimeout(() => {
                                            overwolf.windows.close('settings');
                                        }, 2500);
                                    });
                                });
                            }
                        });
                    });
                } catch(e) {
                    reject();
                }
            })();
        })
    }
});