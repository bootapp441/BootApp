document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        function isInCorrectState() {
            const currentCity = $('.player-location .city-name').text().trim();
            const cityKeyMap = {
                "Chicago": "CHI",
                "New York City": "NYC",
                "Rocky Mount": "RM",
                "New Orleans": "NO",
                "Atlantic City": "AC",
                "Detroit": "DT",
                "Cincinnati": "CIN"
            };
            const cityKey = cityKeyMap[currentCity];
            if (!cityKey) {
                console.warn(`[OC-L-Host] Unknown city: ${currentCity} — skipping.`);
                return false;
            }
            const isEnabled = localStorage.getItem(`oc.leader.city.${cityKey}`) === 'true';
            console.log(`[OC-L-Host] Current city: ${currentCity} [${cityKey}] | Enabled: ${isEnabled}`);
            return isEnabled;
        }        
        
        // === Check if leader mode is enabled ===
        function isLeaderModeEnabled() {
            return localStorage.getItem('oc.leader.mode') === 'true';
        }

        // === Check if OC timer shows 00:00:00 ===
        function isOCReady() {
            const timerText = $('#timer-org .BL-timer-display').text().trim();
            return timerText === '00:00:00';
        }

        // === Try to host an OC ===
        function tryStartOrganizedCrime() {
            const doItBtn = $('input[type="submit"][name="createcrime"]');

            if (doItBtn.length) {
                console.log('[OC-L-Host] Found "Do it!" button — starting crime...');
                doItBtn.trigger('click');
            } else {
                console.log('[OC-L-Host] "Do it!" button not found — already setting up an OC or not on host page.');
            }
        }

        // === Delayed Execution (2–5 sec) ===
        const delay = Math.floor(Math.random() * 3000) + 2000; // between 2000–5000 ms
        console.log(`[OC-L-Host] Waiting ${delay}ms before checking leader mode & timer...`);

        setTimeout(() => {
            if (isLeaderModeEnabled() && isOCReady() && isInCorrectState()) {
                console.log('[OC-L-Host] Leader Mode is ON and timer is ready.');
                tryStartOrganizedCrime();
            } else {
                console.log('[OC-L-Host] Conditions not met — will not start crime.');
            }
        }, delay);
    });
});
