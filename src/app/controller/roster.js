define(function() {
    return {
        init
    };

    function init(events) {
        if (window.overwolf) {
            let eventBus = overwolf.windows.getMainWindow().eventBus;
            eventBus.on('updatedRoster', function(data) {
                render(data.all);
            });
        } else {
            let cls = ['neutral', 'dominated', 'rabbit', 'unknown'];
            let all = ["1BjornIronside1","666-Destroer-666","Alessandro_1","Alkatratzz","AnOnYmOuS_94","AsansorKabini","Belthazor","Benny_136","Best_of-The-Best","BiaSDaimon","Briseiss","BugraCerA","C6665897","CAGRI7","CHepaeff","Callyps0","CarrolusRex","Chikenmann","CptToffer","DEAD_FUCKER","Digital87","Dimka163","Discopolis","Douyu-5502205","ERDANGEROUS","ETOleto","Ertugrul67","FUfuJIADI","Fabii97","FallInMyHand","FengGream","Gaojuneee","Geron1x","Gunya228","HadesNDM_0815","Helfas","HellRide80","JusticeArwenS","K1ngin","KEOMA1964","KOFTECIYUSUF","KULIM-55","K_O_JI_T","Kanser0Jen","L4DB","LavrikDinozavrik","Luka24","LupusAraneae","MNI_Luka","MR_Yolo","Mmarangozz","Mrs_Yolo","NastranJR","Nemou9","Nevigohk","Nicktarr","Nitato","NukeDukem2D","Oleg_T22","OneInDarkness","Owrangerz","Phoenix2a","R3BB3LLY","Rapidsan","Respecteer","Rezonator_911","Rik7813","SEKILORDEK","SamZhang816","Scottio200","SergeiSV02","SgtCyberX","Shadowlar","Sicario_ZA","SnowGlucK","TIMA_020_","TenTen88","TheStormrider_HD","Togatta","WolverineLOGAN35","XyetaKakaEta","YlLb","Zanql","cCcTamamcCc","faleloki","greasyfro","loufiasco","mc-mingming","onurpet8","pRo_Rar","prime29","puskin31tr","sesik","xFavx","xZePlin","xeno-wolf","zzs7700"]
                .map(n => {
                    return {
                        name: n,
                        type: cls[Math.floor(Math.random() * 3)]
                    };
                });
            render(all);
        }
    }

    function render(data) {
        let node = document.querySelector('#roster');
        node.innerHTML = '';
        let html = '';
        data.forEach((p) => {
            html += `<div class="player"><div class="icon ${p.type}"></div><span>${p.name}</span></div>`;
        });
        node.innerHTML = html;
    }
});