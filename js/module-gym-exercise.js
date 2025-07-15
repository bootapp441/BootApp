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

        function getCurrentEnergy() {
            const energyBar = document.querySelector('.BL-energy-bar[data-type="1"] .label');
            return energyBar ? parseInt(energyBar.textContent.split('/')[0], 10) || 0 : 0;
        }

        const exerciseData = [
            { id: 1, name: "Bench Press", energy: 100 },
            { id: 2, name: "Heavy Bag", energy: 100 },
            { id: 3, name: "Speed Bag", energy: 100 },
            { id: 4, name: "Monkey Bars", energy: 100 },
            { id: 5, name: "Dumbbells", energy: 100 },
            { id: 7, name: "Beach Run", energy: 100 }
        ];

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        function getRandomDelay(min = 500, max = 800) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function getEnabledExercises() {
            return exerciseData.filter(ex => {
                const setting = localStorage.getItem(`enableExercise.${ex.id}`);
                return setting === null ? true : setting === 'true';
            });
        }

        function getCurrentExerciseId() {
            const active = $('.exercise-info.show .name').text().trim();
            const match = exerciseData.find(e => e.name === active);
            return match ? match.id : null;
        }

        async function switchToExercise(targetId) {
            const rightArrow = document.querySelector('.BL-wide-arrow.arrow-right');
            const leftArrow = document.querySelector('.BL-wide-arrow.arrow-left');

            let attempts = 0;
            const maxAttempts = 10;

            while (attempts < maxAttempts) {
                const currentId = getCurrentExerciseId();
                if (currentId === targetId) return;

                if (rightArrow) rightArrow.click();
                await sleep(getRandomDelay(100, 200));
                attempts++;
            }
        }

        async function doExerciseRoutine() {
            
            if (localStorage.getItem('enableExercise') !== 'true') {
                console.log("Gym exercise is disabled in settings.");
                return;
            }
                        
            const currentEnergy = getCurrentEnergy();
            const enabled = getEnabledExercises();

            // Only keep exercises that can be done with current energy
            const applicable = enabled.filter(ex => ex.energy <= currentEnergy);
            if (applicable.length === 0) {
                console.log(`Not enough energy for any enabled exercise. Current energy: ${currentEnergy}`);
                setTimeout(doExerciseRoutine, getRandomDelay(10000, 15000)); // Recheck after 10–15s
                return;
            }

            console.log(`Starting exercise session. Current energy: ${currentEnergy}`);

            const shuffled = applicable.sort(() => 0.5 - Math.random());

            for (let ex of shuffled) {
                let available = getCurrentEnergy();
                if (available < ex.energy) {
                    console.log(`Stopped. Not enough energy for ${ex.name}. Needed: ${ex.energy}, Available: ${available}`);
                    break;
                }

                await switchToExercise(ex.id);
                await sleep(getRandomDelay(200, 400));

                const button = document.querySelector('.exercise-info.show .exercise-button');
                if (button) {
                    if (isCaptchaActive()) {
                        handleCaptchaDetected();
                        console.log("Exercise session complete. Waiting to recheck energy...");
                        setTimeout(doExerciseRoutine, getRandomDelay(10000, 15000)); // Recheck after 10–15s
                        return;
                    } else {
                        button.click();
                        console.log(`Performed: ${ex.name}`);
                    }
                }

                await sleep(getRandomDelay(1000, 2000));
            }

            console.log("Exercise session complete. Waiting to recheck energy...");
            setTimeout(doExerciseRoutine, getRandomDelay(10000, 15000)); // Loop again
        }

        setTimeout(() => {
            doExerciseRoutine();
        }, getRandomDelay(1000, 2000));
    });
});
