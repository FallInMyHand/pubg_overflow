define(function() {
    let settings = localStorage.getItem('roster') ? JSON.parse(localStorage.getItem('roster')) : { view: 'all', transparent: true };
    let data;

    return {
        init
    };

    function init(events) {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            ready();
        } else {
            document.addEventListener('DOMContentLoaded', function(event) {
                ready();
            });
        }
    }

    function ready() {
        if (window.overwolf) {
            let main = overwolf.windows.getMainWindow();
            let eventBus = main.eventBus;
            eventBus.on('updatedRoster', function(edata) {
                data = edata.all;
                render();
                initUI();
            });
            eventBus.loaded.push('roster');
        } else {
            let cls = ['neutral', 'dominated', 'rabbit', 'unknown'];
            let all = ["1BjornIronside1","666-Destroer-666","Alessandro_1","Alkatratzz","AnOnYmOuS_94","AsansorKabini","Belthazor","Benny_136","Best_of-The-Best","BiaSDaimon","Briseiss","BugraCerA","C6665897","CAGRI7","CHepaeff","Callyps0","CarrolusRex","Chikenmann","CptToffer","DEAD_FUCKER","Digital87","Dimka163","Discopolis","Douyu-5502205","ERDANGEROUS","ETOleto","Ertugrul67","FUfuJIADI","Fabii97","FallInMyHand","FengGream","Gaojuneee","Geron1x","Gunya228","HadesNDM_0815","Helfas","HellRide80","JusticeArwenS","K1ngin","KEOMA1964","KOFTECIYUSUF","KULIM-55","K_O_JI_T","Kanser0Jen","L4DB","LavrikDinozavrik","Luka24","LupusAraneae","MNI_Luka","MR_Yolo","Mmarangozz","Mrs_Yolo","NastranJR","Nemou9","Nevigohk","Nicktarr","Nitato","NukeDukem2D","Oleg_T22","OneInDarkness","Owrangerz","Phoenix2a","R3BB3LLY","Rapidsan","Respecteer","Rezonator_911","Rik7813","SEKILORDEK","SamZhang816","Scottio200","SergeiSV02","SgtCyberX","Shadowlar","Sicario_ZA","SnowGlucK","TIMA_020_","TenTen88","TheStormrider_HD","Togatta","WolverineLOGAN35","XyetaKakaEta","YlLb","Zanql","cCcTamamcCc","faleloki","greasyfro","loufiasco","mc-mingming","onurpet8","pRo_Rar","prime29","puskin31tr","sesik","xFavx","xZePlin","xeno-wolf","zzs7700"]
                .map(n => {
                    return {
                        name: n,
                        type: cls[Math.floor(Math.random() * 3)],
                        alive: Math.random() > 0.2
                    };
                });
            data = all;
            render();
            initUI();
        }
    }

    function render() {
        _d = data;
        let node = document.querySelector('#roster');
        node.innerHTML = '';
        let html = '';
        if (_d) {
            if (settings.view === 'alive') {
                _d = _d.filter(v => v.alive);
            } else if (settings.view === 'dead') {
                _d = _d.filter(v => !v.alive);
            }
            _d.forEach((p) => {
                html += `<div class="player ${p.alive ? '' : 'dead'}"><div class="icon ${p.type}"></div><span>${p.name}</span></div>`;
            });
        }
        node.innerHTML = html;
    }

    function initUI() {
        let body = document.querySelector('body');
        if (settings.transparent) {
            body.classList.add('transparent');
        }

        let is_transparent = document.querySelector('#transparent');
        if (settings.transparent) {
            is_transparent.checked = true;
        }
        document.querySelector(`[name="view"][value="${settings.view}"]`).checked = true;
        is_transparent.addEventListener('change', function(e) {
            settings.transparent = this.checked;
            if (settings.transparent) {
                body.classList.add('transparent');
            } else {
                body.classList.remove('transparent');
            }
            saveSettings();
        });

        let radio = document.querySelectorAll('input[name="view"]');
        radio.forEach((r) => {
            r.addEventListener('change', function() {
                settings.view = this.value;
                render();
                saveSettings();
            });
        });

        document.querySelector('body').classList.remove('loading');
    }

    function saveSettings() {
        localStorage.setItem('roster', JSON.stringify(settings));
    }
});