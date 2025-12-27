document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {

        /* ======== HELPERS ======== */
        function getUsername() {
            const usernameDiv = document.querySelector('.character-container .username a');
            return usernameDiv ? usernameDiv.textContent.trim().substring(0, 3) : 'unknown';
        }

        function sendWebhookMessage(description) {
            const discordEnabled = localStorage.getItem('discord.enabled') === 'true';
            const webhookURL = localStorage.getItem('discord.webhook.8'); // Auto Theft webhook

            if (discordEnabled && webhookURL) {
                const data = { embeds: [{ description: description, color: 0x800080 }] };
                $.ajax({
                    url: webhookURL,
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(data),
                    success: () => console.log('[Webhook] Auto Theft message sent.'),
                    error: (xhr, status, error) => console.error('[Webhook Error]', xhr.status, error)
                });
            } else {
                console.log('[Webhook] Skipped: discord.enabled=false or webhook.6 is empty.');
            }
        }

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

        /* ======== CRIME ATTEMPT ======== */
        function attemptCrimes() {
            if (isCaptchaActive()) { handleCaptchaDetected(); return; }

            const energy = parseInt(
                document.querySelector('.BL-progress-bar[data-player-bar="criminal"] .label')
                    ?.textContent.split('/')[0] || 0,
                10
            );

            function isCrimeEnabled(crimeId) {
                return localStorage.getItem(`crimeEnabled_${crimeId}`) !== 'false';
            }

            // === Crime ID 4: Special Handling ===
            if (isCrimeEnabled(4)) {
                const container = document.querySelector('.crime[data-id="4"]');
                if (container && !container.classList.contains('is-locked') && !container.classList.contains('not-available')) {
                    const button = container.querySelector('.commit-button');
                    const car = container.querySelector('.car-image');
                    const timer = container.querySelector('.BL-timer-display')?.textContent.trim();
                    const username = getUsername();
                    if (button && car?.innerHTML.trim() !== '' && energy >= 100 && (!timer || timer === '00:00:00')) {
                        console.log("Conditions met for Restaurant Crime.");
                        if (isCaptchaActive()) { handleCaptchaDetected(); return; }
                        button.click();
                        setTimeout(() => checkStealOutcome(username), 100);
                        return;
                    }
                }
            }

            // === Default crimes: ALL crimes except 4 ===
            const crimes = [...document.querySelectorAll('.crime[data-id]')]
                .map(c => c.dataset.id)
                .filter(id => id && id !== '4');

            for (const id of crimes) {
                if (!isCrimeEnabled(id)) continue;

                const container = document.querySelector(`.crime[data-id="${id}"]`);
                if (!container || container.classList.contains('is-locked') || container.classList.contains('not-available')) continue;

                const button = container.querySelector('.commit-button');
                const timer = container.querySelector('.BL-timer-display')?.textContent.trim();

                // use DOM energy cost (no hardcoded IDs)
                const requiredEnergy = parseInt(container.querySelector('.energy-cost')?.textContent || '999', 10);

                if (button && (!timer || timer === '00:00:00') && energy >= requiredEnergy) {
                    if (isCaptchaActive()) { handleCaptchaDetected(); return; }
                    button.click();
                    return;
                }
            }

            console.log("No valid crime found.");
        }

        /* ======== SHOOT / RUN HANDLER ======== */
        function handleChoices() {
            const jammedDiv = document.querySelector('.BL-jammed-up.show');
            if (!jammedDiv) return;

            const shootButton = jammedDiv.querySelector('input[data-choice="shoot"]');
            const runButton = jammedDiv.querySelector('input[data-choice="run"]');
            const shootChance = parseFloat(jammedDiv.querySelector('.shoot-chance')?.textContent.replace('%', '') || 0);
            const runChance = parseFloat(jammedDiv.querySelector('.run-chance')?.textContent.replace('%', '') || 0);

            if (isCaptchaActive()) { handleCaptchaDetected(); return; }
            if (shootChance > runChance && shootButton) shootButton.click();
            else if (runButton) runButton.click();
        }

        /* ======== SCHEDULERS ======== */
        function scheduleRandomInterval() {
            const interval = Math.floor(Math.random() * (20 - 14 + 1) + 14) * 1000;
            setTimeout(() => { attemptCrimes(); scheduleRandomInterval(); }, interval);
        }

        setInterval(handleChoices, 300);
        setTimeout(() => { if (!isCaptchaActive()) attemptCrimes(); }, Math.random() * 1000 + 1000);

        scheduleRandomInterval();
    });
});
