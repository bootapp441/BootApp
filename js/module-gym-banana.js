document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {

        const AVAILABLE_SPACE = parseInt(localStorage.getItem('availableSpace')) || 25;

        const isBananaBuyEnabled = () => {
            const setting = localStorage.getItem('enableBananaBuy');
            return setting === 'true';
        };

        // Helper to get a random delay in milliseconds
        function getRandomDelay(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min) * 1000;
        }

        // A helper that returns a promise that resolves after 'ms' milliseconds
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async function buyBananas() {
            // 1. Check city name
            const cityName = $('.city-name').text().trim();
            if (cityName !== 'Atlantic City') {
                console.log("Not in Atlantic City. Redirecting...");
                await sleep(getRandomDelay(8, 10));
                if (isBananaBuyEnabled()) {
                    window.location.href = 'https://www.bootleggers.us/crimes.php';
                }
                return;
            }

            // 2. Click left arrow to reveal banana
            const leftArrow = document.querySelector('.BL-wide-arrow.arrow-left');
            if (leftArrow) {
                leftArrow.click();
                console.log("Clicked the left arrow to reveal banana purchase button.");
            } else {
                console.log("Left arrow not found, redirecting...");
                await sleep(getRandomDelay(8, 10));
                if (isBananaBuyEnabled()) {
                    window.location.href = 'https://www.bootleggers.us/crimes.php';
                }
                return;
            }

            // Wait a second or two for the panel to update
            await sleep(getRandomDelay(1, 2));

            // 3. Open the character menu
            const menuButton = document.querySelector('.sideBar .cat .items-shortcut');
            if (menuButton) {
                menuButton.click();
                console.log("Character menu opened.");
                // Close character menu if it was opened
                const closeButton = document.querySelector('.icon-close.main');
                if (closeButton) {
                    closeButton.click();
                    console.log("Character menu closed.");
                }
            } else {
                console.log("Menu button not found, redirecting...");
                await sleep(getRandomDelay(8, 10));
                if (isBananaBuyEnabled()) {
                    window.location.href = 'https://www.bootleggers.us/crimes.php';
                }
                return;
            }

            // Wait a bit for the menu to open and carrying info to load
            await sleep(getRandomDelay(1, 3));

            // 4. Check carrying capacity
            const carryingSpan = document.querySelector('.carry-information span.carrying');
            const limitSpan = document.querySelector('.carry-information span.carry-limit');
            if (!carryingSpan || !limitSpan) {
                console.log("Carry info not found, redirecting...");
                await sleep(getRandomDelay(8, 10));
                if (isBananaBuyEnabled()) {
                    window.location.href = 'https://www.bootleggers.us/crimes.php';
                }
                return;
            }

            const carrying = parseInt(carryingSpan.textContent.trim(), 10);
            const carryLimit = parseInt(limitSpan.textContent.trim(), 10);
            let availableSpace = carryLimit - carrying - AVAILABLE_SPACE;
            if (availableSpace < 0) availableSpace = 0;
            console.log("Available slots for bananas:", availableSpace);

            // 5. Get the purchase button
            const purchaseButton = document.querySelector('.exercise-info.show input.exercise-button[value="Purchase!"]');
            if (!purchaseButton) {
                console.log("Purchase button not found, redirecting...");
                await sleep(getRandomDelay(8, 10));
                if (isBananaBuyEnabled()) {
                    window.location.href = 'https://www.bootleggers.us/crimes.php';
                }
                return;
            }

            // 6. Loop to buy bananas, strictly one at a time
            for (let i = 0; i < availableSpace; i++) {
                purchaseButton.click();
                console.log(`Purchased banana #${i + 1}`);

                // Wait for a random delay (1-3s) before next purchase  
                // (0.3-0.6s might be too fast and can cause missed clicks or anti-bot triggers)
                await sleep(getRandomDelay(1, 3));
            }

            console.log("Done buying bananas. Will redirect to crimes page in 8–10s...");
            await sleep(getRandomDelay(8, 10));
            if (isBananaBuyEnabled()) {
                window.location.href = 'https://www.bootleggers.us/crimes.php';
            }
        }

        // Start after a random delay (1–3s) so we don’t spam instantly upon load
        setTimeout(() => {
            const setting = localStorage.getItem('enableBananaBuy');
            const isEnabled = setting === null ? false : setting === 'true';
            if (!isEnabled) {
                console.log("Banana buying is disabled via toggle (enableBananaBuy = false).");
                return;
            }

            buyBananas().catch(e => console.error("Error in buyBananas:", e));
        }, getRandomDelay(1, 3));
    });
});
