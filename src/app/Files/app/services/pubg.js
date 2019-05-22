define(['app/utils/ajax'], function(ajax) {
    const proxy_url = 'https://9d83ymjka8.execute-api.us-east-1.amazonaws.com/challenge';
    const match_url = 'https://api.pubg.com/shards/steam/matches';

    return {
        find,
        getAccountId,
        getMatchAsset,
        getTelemetry,
        getMatcheIds
    };

    function find(name) {
        ajax(`${proxy_url}/players?filter[playerNames]=${name}`, { method: 'GET' });
    }

    async function getAccountId(name) {
        return new Promise(async function(resolve, reject) {
            try {
                let result = JSON.parse(await ajax(`${proxy_url}/players?filter[playerNames]=${name}`, { method: 'GET' }));
                if (result.data && Array.isArray(result.data) && result.data.length > 0) {
                    resolve(result.data[0].id);
                } else {
                    reject('bad request');
                }
            } catch(e) {
                reject('bad request');
            }
        });
    }

    async function getMatchAsset(match_id) {
        return new Promise(async function(resolve, reject) {
            let result = JSON.parse(await ajax(`${match_url}/${match_id}`, { method: 'GET', headers: { accept: 'application/vnd.api+json' } }));
            let asset = result.included.find((d) => d.type === 'asset');
            if (asset) {
                resolve(asset);
            } else {
                reject();
            }
        });
    }

    async function getTelemetry(url) {
        return new Promise(async function(resolve, reject) {
            let result = JSON.parse(await ajax(url, { method: 'GET', headers: { accept: 'application/vnd.api+json' } }));
            if (result) {
                resolve(result);
            } else {
                reject();
            }
        });
    }

    async function getMatcheIds(user_name) {
        return new Promise(async function(resolve, reject) {
            let result = JSON.parse(await ajax(`${proxy_url}/players?filter[playerNames]=${user_name}`, { method: 'GET' }));
            if (result.data && Array.isArray(result.data) && result.data.length > 0) {
                let matches = result.data[0].relationships.matches.data;

                if (matches.length > 0) {
                    resolve(matches.map(m => m.id));
                } else {
                    reject();
                }
            } else {
                reject();
            }
        });
    }
});