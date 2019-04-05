define(function() {
    const items = ['unknown', 'dominated', 'neutral', 'rabbit'];

    return {
        init
    };

    function init(events) {
        if (window.overwolf) {
            let mainEventBus = overwolf.windows.getMainWindow().eventBus;
            mainEventBus.on('updatedRoster', function(obj) {
                update(obj);
            });
            mainEventBus.trigger('overlayReady', {
                callback: (overlay) => {
                    initOverlayEvents(overlay);
                }
            });
        }
    }

    function update(obj) {
        let toolbar = document.querySelector('.toolbar');
        items.forEach((k) => {
            toolbar.querySelector(`.item[data-type="${k}"] .value`).innerHTML = obj[k];
        });
    }

    function initOverlayEvents(overlay) {
        let dmg_node = document.querySelector('.status-bar .value');
        overlay.events.on('statChanged', (e) => {
            dmg_node.innerHTML = e.value;
        });
    }
});