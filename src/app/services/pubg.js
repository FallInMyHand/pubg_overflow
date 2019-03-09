define(['app/utils/ajax'], function(ajax) {
    const proxy_url = 'https://9d83ymjka8.execute-api.us-east-1.amazonaws.com/challenge';

    return {
        find
    };

    function find(name) {
        ajax(`${proxy_url}/players?filter[playerNames]=${name}`, { method: 'GET' });
    }
});