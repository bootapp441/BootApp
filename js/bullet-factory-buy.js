document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        console.log("Document is ready.");

        let autoPurchaseStarted = false;
        let purchaseCount = 0; // Counter for purchases
        let totalSpent = 0; // Total amount of dollars spent

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

        // Function to get the current cost per bullet
        function getCostPerBullet() {
            const costElement = document.querySelector('.per-bullet');
            if (costElement) {
                // Extract and parse the cost as an integer
                const costText = costElement.textContent.replace(/[^0-9]/g, '');
                const costPerBullet = parseInt(costText, 10);
                console.log(`Cost per bullet retrieved: $${costPerBullet}`);
                return costPerBullet;
            } else {
                console.log("Cost per bullet element not found.");
                return null;
            }
        }

        function isFactoryBuyEnabled() {
            const setting = localStorage.getItem('enableFactoryBuy');
            return setting === null ? true : setting === 'true';
        }

        // Function to perform auto purchase
        function autoPurchase() {

            if (isCaptchaActive()) {
                handleCaptchaDetected();
                setTimeout(autoPurchase, 10000); // Retry every 10 seconds
                return;
            }

            const costPerBullet = getCostPerBullet();
            if (!costPerBullet) {
                console.log("Unable to retrieve cost per bullet. Aborting auto-purchase.");
                return;
            }

            const bulletsPerPurchase = 100;
            const costPerPurchase = costPerBullet * bulletsPerPurchase;

            purchaseCount++; // Increment the purchase count
            totalSpent += costPerPurchase; // Add cost to total spent
            console.log(`Auto-purchase #${purchaseCount} triggered. Purchase amount: $${costPerPurchase.toLocaleString()}, Total spent: $${totalSpent.toLocaleString()}`);

            // Set bullet quantity to 100
            let bulletInput = document.querySelector('input[name="amount"]');
            if (bulletInput) {
                bulletInput.value = bulletsPerPurchase;
                console.log("Set bullet quantity to 100.");
            } else {
                console.log("Bullet quantity input field not found.");
                return;
            }

            // Find and click the purchase button
            let purchaseButton = document.querySelector('.purchase-button input[type="submit"]');
            if (purchaseButton) {
                purchaseButton.click();
                console.log("Purchase button clicked.");
            } else {
                console.log("Purchase button not found.");
                return;
            }

            // Set a random interval between 31.2 and 32.9 seconds
            let randomDelay = 31200 + Math.random() * 1700;
            console.log(`Next purchase in ${randomDelay / 1000} seconds`);

            // Schedule the next auto-purchase
            setTimeout(autoPurchase, randomDelay);
        }

        // Listen for the first manual purchase
        document.querySelector('.purchase-button input[type="submit"]').addEventListener('click', function () {
            if (!autoPurchaseStarted && isFactoryBuyEnabled()) {
                autoPurchaseStarted = true;
                console.log("First manual purchase detected. Starting auto-purchase.");

                // Start the first auto-purchase after a random delay
                setTimeout(autoPurchase, 31200 + Math.random() * 1700);
            } else if (!isFactoryBuyEnabled()) {
                console.log("Auto-purchase is disabled via toggle (enableFactoryBuy = false).");
            }
        });
    });
});
