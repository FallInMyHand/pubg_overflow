define(function() {
    return {
        init
    };

    function init(events) {
        let eventBus = overwolf.windows.getMainWindow().eventBus;

        eventBus.on('updatedRoster', function(data) {
            console.log('update', data);
            let node = document.querySelector('#roster');
            node.innerHTML = '';
            let html = '';
            data.all.forEach((p) => {
                html += `<div class="player">${p}</div>`;
            });
            node.innerHTML = html;
        });
    }
});