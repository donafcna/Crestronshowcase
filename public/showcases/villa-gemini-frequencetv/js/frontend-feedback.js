/**
 * Front-End Local Feedback Engine for Crestron CH5 Showcase (Villa Crans Montana)
 * Handles all button states, toggles, scenes, sources, thermostats, mute, and alarms locally
 * without requiring communication with a physical CP4 controller.
 */
(function setupFrontEndFeedback() {
    console.log("CH5: Initialisation du moteur de feedback local Front-End...");
    
    // Internal state dictionary
    var localState = {
        b: { '21': true, '42': true, '151': true }, // initial digital states
        n: { '51': 1, '52': 32768, '21': 49152, '71': 49152, '72': 32768, '73': 20000, '74': 30000, '75': 10000, '76': 25000 },
        s: { '32': '21.5°C', '33': 'CHAUFFAGE', '34': '22.0°C', '99': '04', '101': 'villaftv.cpz', '104': '21/07/2026' }
    };
    
    var localSubscribers = { b: {}, n: {}, s: {} };
    
    function dispatchLocalState(type, join, value) {
        var joinStr = String(join);
        localState[type][joinStr] = value;
        
        // 1. Fire registered CrComLib subscribers for this join
        if (localSubscribers[type] && localSubscribers[type][joinStr]) {
            localSubscribers[type][joinStr].forEach(function(cb) {
                try { cb(value); } catch(e) { console.error("Error in subscriber callback:", e); }
            });
        }
        
        // 2. Direct DOM update for ch5-button and HTML buttons matching join
        if (type === 'b') {
            var isTrue = (value === true || value === 'true' || value === 1 || value === '1');
            var btns = document.querySelectorAll('ch5-button[receiveStateSelected="' + joinStr + '"], ch5-button[sendEventOnClick="' + joinStr + '"]');
            btns.forEach(function(btn) {
                if (isTrue) {
                    btn.setAttribute('selected', 'true');
                    btn.setAttribute('pressed', 'true');
                    btn.classList.add('ch5-button--selected', 'selected', 'active');
                } else {
                    btn.removeAttribute('selected');
                    btn.removeAttribute('pressed');
                    btn.classList.remove('ch5-button--selected', 'selected', 'active');
                }
            });
        }
    }

    var waitLib = setInterval(function() {
        if (typeof CrComLib !== 'undefined' && CrComLib.publishEvent && CrComLib.subscribeState) {
            clearInterval(waitLib);
            
            var realPublish = CrComLib.publishEvent.bind(CrComLib);
            var realSubscribe = CrComLib.subscribeState.bind(CrComLib);
            
            // Override subscribeState to record subscribers and feed instant initial state
            CrComLib.subscribeState = function(type, join, callback) {
                var subId = realSubscribe(type, join, callback);
                var joinStr = String(join);
                if (!localSubscribers[type]) localSubscribers[type] = {};
                if (!localSubscribers[type][joinStr]) localSubscribers[type][joinStr] = [];
                localSubscribers[type][joinStr].push(callback);
                
                if (localState[type] && localState[type][joinStr] !== undefined) {
                    setTimeout(function() {
                        try { callback(localState[type][joinStr]); } catch(e) {}
                    }, 0);
                }
                return subId;
            };
            
            // Override publishEvent to create front-end feedback loop
            CrComLib.publishEvent = function(type, join, value) {
                realPublish(type, join, value);
                
                var joinStr = String(join);
                
                if (type === 'b') {
                    var isTrue = (value === true || value === 'true' || value === 1 || value === '1');
                    if (isTrue) {
                        // Scene Buttons (21: OFF, 22: CINEMA, 23: REPAS, 24: TOTAL)
                        var scenes = ['21', '22', '23', '24'];
                        if (scenes.indexOf(joinStr) !== -1) {
                            scenes.forEach(function(j) {
                                dispatchLocalState('b', j, j === joinStr);
                            });
                            return;
                        }
                        
                        // AV Sources (151: APPLE TV, 152: SKY Q, 153: SWISSCOM, 154: IPTV, 150: OFF)
                        var sources = ['150', '151', '152', '153', '154'];
                        if (sources.indexOf(joinStr) !== -1) {
                            sources.forEach(function(j) {
                                dispatchLocalState('b', j, j === joinStr);
                            });
                            var srcIdxMap = { '150': 0, '151': 1, '152': 2, '153': 3, '154': 4 };
                            if (srcIdxMap[joinStr] !== undefined) {
                                dispatchLocalState('n', '51', srcIdxMap[joinStr]);
                            }
                            return;
                        }
                        
                        // Alarm (41: Arm, 42: Disarm)
                        if (joinStr === '41') {
                            dispatchLocalState('b', '41', true);
                            dispatchLocalState('b', '42', false);
                            return;
                        }
                        if (joinStr === '42') {
                            dispatchLocalState('b', '41', false);
                            dispatchLocalState('b', '42', true);
                            return;
                        }
                        
                        // Mute toggle (53)
                        if (joinStr === '53') {
                            var curMute = !localState.b['53'];
                            dispatchLocalState('b', '53', curMute);
                            return;
                        }
                        
                        // Thermostat (+ 35, - 36)
                        if (joinStr === '35' || joinStr === '36') {
                            var curTempStr = localState.s['34'] || '22.0°C';
                            var num = parseFloat(curTempStr.replace('°C', '').replace(',', '.'));
                            if (isNaN(num)) num = 22.0;
                            var delta = (joinStr === '35') ? 0.5 : -0.5;
                            var newTemp = (Math.max(16, Math.min(30, num + delta))).toFixed(1) + '°C';
                            dispatchLocalState('s', '34', newTemp);
                            return;
                        }

                        // Generic digital toggle for any other button
                        var curVal = !localState.b[joinStr];
                        dispatchLocalState('b', joinStr, curVal);
                    }
                } else if (type === 'n') {
                    dispatchLocalState('n', joinStr, Number(value));
                } else if (type === 's') {
                    dispatchLocalState('s', joinStr, String(value));
                }
            };
            
            // Global click capture to ensure any <ch5-button> click triggers front-end feedback
            document.addEventListener('click', function(e) {
                var btn = e.target.closest('ch5-button');
                if (btn) {
                    var sendJoin = btn.getAttribute('sendEventOnClick');
                    if (sendJoin) {
                        CrComLib.publishEvent('b', sendJoin, true);
                        setTimeout(function() { CrComLib.publishEvent('b', sendJoin, false); }, 50);
                    }
                }
            }, true);
        }
    }, 50);
})();
