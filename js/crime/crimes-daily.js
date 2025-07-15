// ==UserScript==
// @name         Bootleggers: Auto Daily Crime Toggle (with delay)
// @version      1.0
// @description  Enable crimes with unfinished daily on load; disable when completed every 5 minutes. Starts 8–20s after load.
// ==/UserScript==

document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {

        const MIN_DELAY = 8000;   // 8 seconds
        const MAX_DELAY = 20000;  // 20 seconds
        const delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);

        console.log(`[AutoCrimeToggle] Waiting ${Math.round(delay / 1000)}s before starting...`);

        setTimeout(() => {
            if (!isDailyCrimeToggleEnabled()) {
                console.log("[AutoCrimeToggle] Skipped — toggle is OFF in localStorage.");
                return;
            }

            // ===============================
            // Helper: Check if daily is completed
            // ===============================
            function isDailyCompleted(crimeElement) {
                const dailyActivities = crimeElement.querySelectorAll('.daily-activity');
                if (!dailyActivities.length) return false;

                for (const activity of dailyActivities) {
                    const label = activity.querySelector('.label');
                    if (!label) continue;
                    const [current, total] = label.textContent.split('/').map(Number);
                    if (current < total) return false;
                }

                return true;
            }

            // ===============================
            // Enable crimes with active dailies on page load
            // ===============================
            function enableCrimesOnLoad() {
                const crimeElements = document.querySelectorAll('.crime');

                crimeElements.forEach(crime => {
                    const crimeId = crime.getAttribute('data-id');
                    const checkbox = crime.querySelector(`.crime-toggle[data-id="${crimeId}"]`);
                    const dailyContainer = crime.querySelector('.daily-activities');

                    if (!checkbox || !dailyContainer) return;

                    if (!isDailyCompleted(crime)) {
                        if (!checkbox.checked) {
                            checkbox.click(); // Enable
                            console.log(`Crime ${crimeId}: daily active → enabling.`);
                        }
                    }
                });
            }

            // ===============================
            // Disable crimes if daily is completed (runs every 5 min)
            // ===============================
            function autoDisableCompletedCrimes() {
                const crimeElements = document.querySelectorAll('.crime');

                crimeElements.forEach(crime => {
                    const crimeId = crime.getAttribute('data-id');
                    const checkbox = crime.querySelector(`.crime-toggle[data-id="${crimeId}"]`);
                    const dailyContainer = crime.querySelector('.daily-activities');

                    if (!checkbox || !checkbox.checked || !dailyContainer) return;

                    if (isDailyCompleted(crime)) {
                        checkbox.click(); // Disable
                        console.log(`Crime ${crimeId}: daily completed → disabling.`);
                    }
                });
            }

            // ===============================
            // Start Logic
            // ===============================
            console.log("[AutoCrimeToggle] Starting crime sync after delay...");

            enableCrimesOnLoad(); // Step 1
            autoDisableCompletedCrimes(); // Step 2
            // recheck every 5 minutes
            setInterval(autoDisableCompletedCrimes, 5 * 60 * 1000); // Step 3: Check every 5 minutes

        }, delay); // Random delay between 8 and 20 seconds

        function isDailyCrimeToggleEnabled() {
            const setting = localStorage.getItem('enableDailyCrimes');
            return setting === null ? true : setting === 'true';
        }

    });
});
