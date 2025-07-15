document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {

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

        // Handle jammeed
        function handleChoices() {
            const jammedDiv = document.querySelector('.BL-jammed-up.show');
            if (!jammedDiv) {
                return;
            }

            const shootButton = jammedDiv.querySelector('input[data-choice="shoot"]');
            const runButton = jammedDiv.querySelector('input[data-choice="run"]');
            const shootChanceDiv = jammedDiv.querySelector('.shoot-chance');
            const runChanceDiv = jammedDiv.querySelector('.run-chance');

            const shootChance = shootChanceDiv ? parseFloat(shootChanceDiv.textContent.replace('%', '')) : 0;
            const runChance = runChanceDiv ? parseFloat(runChanceDiv.textContent.replace('%', '')) : 0;

            console.log(`Found <div class='BL-jammed-up show'>. Shoot chance: ${shootChance}%, Run chance: ${runChance}%.`);

            if (isCaptchaActive()) { handleCaptchaDetected(); return; }

            if (shootChance > runChance && shootButton) {
                console.log(`Clicking 'Shoot' with ${shootChance}% chance.`);
                shootButton.click();
            } else if (runButton) {
                console.log(`Clicking 'Run' with ${runChance}% chance.`);
                runButton.click();
            } else {
                console.log("Neither 'Shoot' nor 'Run' options are available.");
            }
        }
        setInterval(() => {
            handleChoices();
        }, 300);
    });
});
