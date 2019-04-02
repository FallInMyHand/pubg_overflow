define(['app/services/pubg'], function(pubgapi) {
    return {
        init
    };

    function init(events) {
        if (document.readyState === 'complete') {
            initUI();
        } else {
            document.addEventListener('DOMContentLoaded', function(event) {
                initUI();
            });
        }
    }

    function initUI() {
        console.log(window.overwolf);
        if (window.overwolf) {
            let eventBus = overwolf.windows.getMainWindow().eventBus;
            let step1 = document.querySelector('#step1');
            let button = step1.querySelector('#step1-check');
            button.addEventListener('click', function() {
                let nickname = step1.querySelector('#step1-username').value.trim();

                if (nickname) {
                    (async function() {
                        try {
                            let accountId = await pubgapi.getAccountId(nickname);
                            eventBus.trigger('obtaintUserData', {
                                username: nickname,
                                accountId: accountId
                            });

                            overwolf.windows.close('settings', callback)
                        } catch(e) {
                            // user not found or other error
                        }
                    }) ();
                }
            });
        }

        console.log('init ui')
    }
});