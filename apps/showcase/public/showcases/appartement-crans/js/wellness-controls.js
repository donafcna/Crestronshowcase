/* Navigation only: measurements and selected states belong to native CH5 feedback. */
(function () {
    var selected = 'hvac', currentRoom = null;
    window.showWellnessPanel = function (name) {
        selected = name;
        document.querySelectorAll('[data-climate-panel]').forEach(function (p) {
            p.hidden = p.dataset.climatePanel !== name;
        });
        document.querySelectorAll('[data-climate-tab]').forEach(function (b) {
            b.setAttribute('aria-selected', String(b.dataset.climateTab === name));
        });
    };
    window.refreshWellnessControls = function (id) {
        var lang = document.getElementById('lang-select'), locale = lang && lang.value;
        if (!locale) { try { locale = localStorage.getItem('crestron_lang'); } catch (_) {} }
        var labels = {fr:['Température actuelle','Humidité actuelle','Consigne'],en:['Current temperature','Current humidity','Setpoint'],de:['Aktuelle Temperatur','Aktuelle Feuchte','Sollwert'],es:['Temperatura actual','Humedad actual','Consigna'],ru:['Температура','Влажность','Уставка']}[locale || 'fr'] || ['Current temperature','Current humidity','Setpoint'];
        document.querySelectorAll('[data-wellness-label]').forEach(function (el) { el.textContent = labels[Number(el.dataset.wellnessLabel)]; });
        var config = window.villaConfigEmbedded || window.villaConfig;
        var room = config && config.pieces.find(function (p) { return p.id === Number(id); });
        var cfg = room && room.pilotages.wellness;
        document.querySelectorAll('[data-wellness-tab]').forEach(function (b) {
            b.hidden = !(cfg && cfg[b.dataset.wellnessTab] && cfg[b.dataset.wellnessTab].actif);
        });
        document.querySelectorAll('.climate-tabs').forEach(function (tabs) {
            var visibles = tabs.querySelectorAll('[data-climate-tab]:not([hidden])').length;
            tabs.classList.toggle('climate-tabs--single', visibles < 2);
        });
        document.querySelectorAll('[data-wellness-range]').forEach(function (el) {
            var section = cfg && cfg[el.dataset.wellnessRange];
            if (section) el.textContent = section.min + '–' + section.max + (el.dataset.wellnessRange === 'sauna' ? ' °C' : ' %');
        });
        if (currentRoom !== Number(id) || (selected !== 'hvac' && !(cfg && cfg[selected] && cfg[selected].actif))) {
            currentRoom = Number(id); window.showWellnessPanel('hvac');
        }
    };
})();
