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

        const meltEnergySelector = 'div[data-player-bar="melt-energy"] .label';
        const costPerBulletSelector = '.per-bullet';
        const defaultMaxBulletCost = 1000;
        function getMaxBulletCost() {
            const stored = localStorage.getItem('maxBulletCost');
            const value = parseInt(stored, 10);
            return isNaN(value) ? defaultMaxBulletCost : value;
        }
        const checkInterval = 5000; // 5 seconds

        function getAvailableMelts() {
            const energyText = $(meltEnergySelector).text().trim();
            const matches = energyText.match(/(\d+)\/\d+/);
            return matches ? parseInt(matches[1], 10) : 0;
        }

        function getBulletCost() {
            const costText = $(costPerBulletSelector).text().trim();
            const numericCost = costText.replace(/[^\d]/g, ''); // Remove all non-numeric characters
            return parseInt(numericCost, 10);
        }

        function randomDelay(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min; // Random delay between min and max
        }

        const processedCars = new Set(); // Track processed car IDs

        function reloadCarList() {
            console.log("Reloading car list...");
            const cars = $('.listings tbody tr.car-listing').filter(function () {
                const carName = $(this).find('.col-car_name').text().trim();
                const carId = $(this).data('player-car-id');
                const modelKey = `modelMelt.${carName.replace(/\s+/g, '_')}`;
                const isModelEnabled = localStorage.getItem(modelKey) === 'true';
                return isModelEnabled && !processedCars.has(carId);
            });

            console.log(
                "Current cars in the list:",
                cars.map((_, car) => ({
                    name: $(car).find('.col-car_name').text().trim(),
                    id: $(car).data('player-car-id'),
                })).get()
            );

            return cars;
        }

        function simulateReloadOrClick() {
            if (isCaptchaActive()) {
                handleCaptchaDetected();
                console.log("[Reload] CAPTCHA active, delaying reload attempt...");
                setTimeout(simulateReloadOrClick, checkInterval); // retry after 5s
                return;
            }
            // 70% chance hyperlink click, 30% reload
            const randomChance = Math.random();
            if (randomChance < 0.7) {
                console.log("Simulating hyperlink click to reload the page (70% chance)");
                simulateHyperlinkClick();
            } else {
                console.log("Using location.reload() to refresh the page (30% chance)");
                location.reload();
            }
        }

        // Function to simulate a hyperlink click
        function simulateHyperlinkClick() {
            const hyperlink = document.createElement('a');
            hyperlink.href = window.location.href; // Current page URL
            hyperlink.click();
        }

        function startRandomReloadTimer() {
            if (!isFactoryMeltEnabled()) {
                console.log("Auto melt is disabled; skipping random reload timer.");
                return;
            }

            const delay = randomDelay(5 * 60 * 1000, 20 * 60 * 1000); // 5–20 minutes
            console.log(`Setting up a random reload or click in ${(delay / 60000).toFixed(2)} minutes...`);
            setTimeout(simulateReloadOrClick, delay);
        }

        function meltSpecifiedCars(index = 0) {
            setTimeout(() => {

                const availableMelts = getAvailableMelts();
                if (availableMelts <= 0) {
                    console.log("No melts left. Stopping melt process.");
                    setTimeout(startMeltingProcess, checkInterval);
                    return;
                }
        
                const cars = reloadCarList();
        
                if (cars.length === 0) {
                    console.log("No cars left in the list. Checking for more melts in 15 seconds...");
                    setTimeout(startMeltingProcess, checkInterval);
                    return;
                }
        
                if (index >= cars.length) {
                    console.log("All specified cars melted. Checking for more melts in 15 seconds...");
                    setTimeout(startMeltingProcess, checkInterval);
                    return;
                }
        
                const car = cars.eq(index);
                const carId = car.data('player-car-id');
                const carName = car.find('.col-car_name').text().trim();
        
                console.log(`Processing car: ${carName} (ID: ${carId})`);
        
                // Mark car as processed
                processedCars.add(carId);
        
                // Select the car
                car.click();
        
                // Adjust slider to 100% if necessary
                const slider = $('.melt-range');
                if (slider.val() !== "100") {
                    slider.val("100").change();
                }
        
                // Trigger the "Melt" button
                const meltButton = $('.select-button');
                meltButton.prop('disabled', false);
                meltButton.trigger('click');
        
                console.log(`${carName} melted successfully. Waiting for the DOM to update before proceeding...`);
        
                // Add delay before moving to the next car
                setTimeout(() => {
                    console.log("Proceeding to the next car...");
                    meltSpecifiedCars(index + 1);
                }, randomDelay(2000, 3000));
            }, randomDelay(2000, 3000));
        }

        function startMeltingProcess() {
            if (isCaptchaActive()) {
                handleCaptchaDetected();
                setTimeout(startMeltingProcess, checkInterval);
                return;
            }
            
            const availableMelts = getAvailableMelts();

            if (availableMelts > 0) {
                const bulletCost = getBulletCost();
                const maxBulletCost = getMaxBulletCost();
                if (bulletCost <= maxBulletCost) {
                    console.log(`Melts available: ${availableMelts}, Bullet cost: $${bulletCost}. Starting the car melting process...`);

                    const cars = reloadCarList();
                    if (cars.length === 0) {
                        console.log("No specified cars available to process.");
                        setTimeout(startMeltingProcess, checkInterval);
                        return;
                    }

                    // Start melting specified cars sequentially
                    meltSpecifiedCars();
                } else {
                    console.log(`Bullet cost ($${bulletCost}) exceeds the limit of $${maxBulletCost}. Rechecking in 5 seconds...`);
                    setTimeout(startMeltingProcess, checkInterval);
                }
            } else {
                console.log(`Insufficient melts available (${availableMelts}). Rechecking in 5 seconds...`);
                setTimeout(startMeltingProcess, checkInterval);
            }
        }

        console.log("Waiting for DOM to load completely...");

        if (isFactoryMeltEnabled()) {
            console.log("Factory melt is enabled via toggle.");
            const initialDelay = randomDelay(2000, 3000);
            setTimeout(startMeltingProcess, initialDelay);
            startRandomReloadTimer();
        } else {
            console.log("Factory melt is disabled via toggle (enableFactoryMelt = false).");
        }

        function isFactoryMeltEnabled() {
            const setting = localStorage.getItem('enableFactoryMelt');
            return setting === null ? true : setting === 'true';
        }
    });
});
