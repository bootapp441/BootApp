document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {

        function isLeaderModeEnabled() {
            return localStorage.getItem('oc.leader.mode') === 'true';
        }

        function isSplitEvenlyEnabled() {
            return localStorage.getItem('oc.leader.splitEvenly') === 'true';
        }

        function getCustomShareArray() {
            const shareStr = localStorage.getItem('oc.leader.share') || '100:10:5:5';
            const parts = shareStr.split(':').map(p => parseInt(p.trim(), 10));
            const total = parts.reduce((sum, n) => sum + n, 0);
            if (total !== 100 || parts.length !== 4 || parts.some(n => isNaN(n))) {
                console.warn('[OC-L-Share] Invalid share format or total != 100. Using default.');
                return [25, 25, 25, 25];
            }
            return parts;
        }

        function trySetSplitEvenly() {
            const splitButton = $('input.split-evenly-button[value="Split evenly!"]');
            if (splitButton.length) {
                console.log('[OC-L-Share] Clicking "Split evenly" button...');
                splitButton.trigger('click');
            } else {
                console.log('[OC-L-Share] "Split evenly" button not found — assuming already split.');
            }
        }

        function trySetCustomShare() {
            const shares = getCustomShareArray();
            let filled = false;

            for (let i = 0; i < 4; i++) {
                const input = $(`input[name="percent[${i + 1}]"]`);
                if (input.length) {
                    input.val(shares[i]);
                    console.log(`[OC-L-Share] Set percent[${i + 1}] to ${shares[i]}%`);
                    filled = true;
                } else {
                    console.warn(`[OC-L-Share] Input percent[${i + 1}] not found.`);
                }
            }

            if (filled) {
                const finalizeBtn = $('input[type="submit"][name="finalize_percents"][value="Finalize percents!"]');
                if (finalizeBtn.length) {
                    console.log('[OC-L-Share] Clicking "Finalize percents" button...');
                    finalizeBtn.trigger('click');
                } else {
                    console.log('[OC-L-Share] "Finalize percents" button not found — assuming already finalized.');
                }
            }
        }

        // === Delayed Execution 2–5 seconds ===
        const delay = Math.floor(Math.random() * 3000) + 2000;
        console.log(`[OC-L-Share] Waiting ${delay}ms before setting shares...`);

        setTimeout(() => {
            if (!isLeaderModeEnabled()) {
                console.log('[OC-L-Share] Leader mode OFF — skipping share setting.');
                return;
            }

            if (isSplitEvenlyEnabled()) {
                trySetSplitEvenly();
            } else {
                trySetCustomShare();
            }
        }, delay);
    });
});
