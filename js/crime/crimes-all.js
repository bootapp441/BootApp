document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {

        /* ======== CONFIG ======== */
        const ENERGY_COST_PER_CRIME = parseInt(localStorage.getItem('crimeCost')) || 10;
        const MIN_ENERGY = parseInt(localStorage.getItem('minEnergy')) || 95;
        const WAIT_BETWEEN_CYCLES_MS = 1000;
        const NO_TIMER_DELAY_MIN_MS = 600;
        const NO_TIMER_DELAY_MAX_MS = 1500;

        /* ======== CAPTCHA CHECK HELPDER SCRIPTS ======== */
        function isCaptchaActive() {
            const solving = localStorage.getItem('captcha.solving') === 'true';
            const solvingSince = parseInt(localStorage.getItem('captcha.solvingStartedAt') || '0', 10);
            const solvedAt = parseInt(localStorage.getItem('captcha.solvedAt') || '0', 10);
            const blockDuration = parseInt(localStorage.getItem('captcha.blockDuration') || '120000', 10);
            const now = Date.now();
        
            // If solving started recently, we block actions
            if (solvingSince && (now - solvingSince < blockDuration)) {
                return true;
            }
        
            // If solving was completed recently, still block actions temporarily
            if (solvedAt && (now - solvedAt < blockDuration)) {
                return true;
            }
        
            return false;
        }

        function handleCaptchaDetected() {
            if (!isCaptchaActive()) return;
            console.log("[Captcha] Detected, clicks paused until solved.");
        }

        /* ======== HELPERS ======== */
        function getEnergy() {
            const text = document.querySelector('.BL-progress-bar[data-player-bar="criminal"] .label')?.textContent.split('/')[0] || '0';
            return parseInt(text, 10) || 0;
        }

        function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

        function isCrimeEnabled(id) { return localStorage.getItem(`crime_enabled_${id}`) === 'true'; }

        function getAllCrimes() {
            return Array.from(document.querySelectorAll('.crimes .crime')).sort((a, b) => (parseInt(b.dataset.id) || 0) - (parseInt(a.dataset.id) || 0));
        }

        function isCrimeOnCooldown(elem) { return elem.classList.contains('BL-timer-active'); }

        function isCrimeNotAvailable(elem) { return elem.classList.contains('not-available'); }

        /* ======== CRIME EXECUTOR ======== */
        async function commitCrimeRepeatedly(elem) {
            const id = elem.dataset.id;
            const btn = elem.querySelector('.commit-button');
            if (!btn) return;

            while (true) {
                if (!isCrimeEnabled(id) || isCaptchaActive()) return;
                if (getEnergy() < MIN_ENERGY + ENERGY_COST_PER_CRIME) return;
                if (isCrimeOnCooldown(elem)) return;

                btn.click();
                const wait = NO_TIMER_DELAY_MIN_MS + Math.random() * (NO_TIMER_DELAY_MAX_MS - NO_TIMER_DELAY_MIN_MS);
                await delay(wait);
                if (isCrimeOnCooldown(elem)) return;
            }
        }

        /* ======== MAIN LOOP ======== */
        async function crimeCycle() {
            if (isCaptchaActive()) { handleCaptchaDetected(); return; }

            for (const elem of getAllCrimes()) {
                const id = elem.dataset.id;
                if (!isCrimeEnabled(id) || isCrimeNotAvailable(elem) || isCrimeOnCooldown(elem)) continue;
                await commitCrimeRepeatedly(elem);
                if (isCaptchaActive()) return;
            }
        }

        async function continuousLoop() {
            while (true) {
                if (isCaptchaActive()) {
                    handleCaptchaDetected();
                    await delay(2000); // wait instead of exiting
                    continue;
                }
                try {
                    await crimeCycle();
                } catch (e) {
                    console.warn("Error in crimeCycle:", e);
                }
                await delay(WAIT_BETWEEN_CYCLES_MS);
            }
        }

        console.log("[AutoCrime] Started");
        setTimeout(() => continuousLoop(), 500 + Math.random() * 500);

    });
});