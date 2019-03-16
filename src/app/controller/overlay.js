define(function() {
    const items = ['unknown', 'dominated', 'neutral', 'rabbit'];

    reset();

    return {
        init
    };

    function init(events) {
        if (overwolf) {
            overwolf.windows.getMainWindow().eventBus.on('updatedRoster', function(obj) {
                update(obj);
            });
        }
    }

    function reset() {
        values = {
            dominated: 0,
            unknown: 0,
            neutral: 0,
            rabbit: 0
        };
    }

    function update(obj) {
        let toolbar = document.querySelector('.toolbar');
        items.forEach((k) => {
            toolbar.querySelector(`.item[data-type="${k}"] .value`).innerHTML = obj[k];
        });
    }
});