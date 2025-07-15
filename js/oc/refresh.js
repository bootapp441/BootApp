document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {


        /* ======== CAPTCHA CHECK HELPER SCRIPTS ======== */
        function isCaptchaActive() {
            const solving = localStorage.getItem('captcha.solving') === 'true';
            const solvingSince = parseInt(localStorage.getItem('captcha.solvingStartedAt') || '0', 10);
            const solvedAt = parseInt(localStorage.getItem('captcha.solvedAt') || '0', 10);
            const blockDuration = parseInt(localStorage.getItem('captcha.blockDuration') || '120000', 10);
            const now = Date.now();

            if (solvingSince && (now - solvingSince < blockDuration)) return true;
            if (solvedAt && (now - solvedAt < blockDuration)) return true;

            return false;
        }

        function handleCaptchaDetected() {
            if (!isCaptchaActive()) return;
            console.log("[Captcha] Detected, clicks and reloads paused until solved.");
        }

        // === Random navigation logic with CAPTCHA check ===
        function scheduleOrgCrimeNavigation() {
            const ENABLE_REFESH = (localStorage.getItem('oc.refresh') || 'false') === 'true';
            if (!ENABLE_REFESH) {
                console.log("[OC-Refresh] Disabled.");
                setTimeout(() => {
                    console.log("[OC-Refresh] CAPTCHA active — delaying navigation.");
                    scheduleOrgCrimeNavigation(); // Retry after another random delay
                }, REFRESH_SECONDS);
                return;
            }
            console.log(`[OC-Refresh] Enabled: ${ENABLE_REFESH}`);

            // refresh time in seconds, default 180 seconds, randomized.
            const REFRESH_SECONDS = Math.floor(Math.random() * parseInt(localStorage.getItem('oc.refresh.seconds')) || 180) * 1000;
            console.log(`[OC-Refresh] Next check in ${Math.floor(REFRESH_SECONDS / 1000 / 60)} minutes...`);

            setTimeout(() => {
                if (isCaptchaActive()) {
                    console.log("[OC-Refresh] CAPTCHA active — delaying navigation.");
                    scheduleOrgCrimeNavigation(); // Retry after another random delay
                } else {
                    console.log("[OC-Refresh] Navigating to /orgcrime.php to update state...");
                    window.location.href = "/orgcrime.php";
                }
            }, REFRESH_SECONDS);
        }

        // Start the first scheduled check
        scheduleOrgCrimeNavigation();
    });
});
