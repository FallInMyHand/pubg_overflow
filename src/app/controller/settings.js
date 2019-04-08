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
        if (window.overwolf) {
            let eventBus = overwolf.windows.getMainWindow().eventBus;

            eventBus.on('installation', function() {
                let installation = document.querySelector('#installation');
                installation.style.display = 'block';

                let button = installation.querySelector('#step1-check');
                button.addEventListener('click', function() {
                    button.disabled = true;

                    let nickname = installation.querySelector('#step1-username').value.trim();
                    let status = installation.querySelector('div[data-role="status"]');
                    status.classList.remove('error');
                    status.classList.add('loading');

                    if (nickname) {
                        (async function() {
                            try {
                                let accountId = await pubgapi.getAccountId(nickname);
                                status.classList.remove('loading');
                                status.classList.add('success');
                                eventBus.trigger('obtaintUserData', {
                                    username: nickname,
                                    accountId: accountId
                                });
                            } catch(e) {
                                // user not found or other error
                                button.disabled = false;
                                status.classList.remove('loading');
                                status.classList.add('error');
                            }
                        }) ();
                    }
                });
                addHelp(eventBus);
            });

            eventBus.on('settings', function() {
                let settings = document.querySelector('#settings');
                settings.style.display = 'block';

                let clear = settings.querySelector('#clear');
                clear.addEventListener('click', function() {
                    let a = confirm('All saved data will be removed from this computer. Are you sure?');
                    if (a) {
                        clear.disabled = true;

                        eventBus.trigger('resetApp');
                    }
                });
                addHelp(eventBus);

                let save = document.querySelector('#save');
                save.addEventListener('click', function(event) {
                });

                let close = document.querySelector('#close');
                close.addEventListener('click', function(event) {
                    overwolf.windows.close('settings');
                });
            });
        }
    }

    function addHelp(eventBus) {
        let help_button = document.querySelector('#help');
        help_button.addEventListener('click', function(event) {
            eventBus.trigger('requestHelp');
        });
    }
});