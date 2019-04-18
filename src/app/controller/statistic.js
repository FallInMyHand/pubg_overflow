define(function() {
    let template = (d) => {
        return `<div class="streak ${d[0] > 0 ? 'kill' : 'death'}"> <span>${d[2]}</span><span>${d[1]}</span></div>`;
    };

    return {
        init
    };

    function init(events) {
        if (window.overwolf) {
            let eventBus = overwolf.windows.getMainWindow().eventBus;
            eventBus.on('streaks', (data) => {
                render(data);
            });
        } else {
            let test =  [
                [-1, 2, 'Hailrake'],
                [1, 1, 'BOJIWE6ctbo']
            ];

            render(test);
        }
    }

    function render(data) {
        let html = '';
        data.forEach(d => {
            html += template(d);
        });

        document.querySelector('#streak-list').innerHTML = html;
    }
})