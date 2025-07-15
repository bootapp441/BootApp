document.addEventListener('DOMContentLoaded', function() {
    $(document).ready(function() {
        function randomDelay() {
            return Math.floor(Math.random() * 1000) + 3000; // Random delay between 3 to 4 seconds
        }

        function extraDelay() {
            return Math.floor(Math.random() * 2000) + 4000; // Random extra delay between 4 to 6 seconds
        }

        function randomHotdogCount() {
            return Math.floor(Math.random() * (26 - 18 + 1)) + 18; // Random number between 18 and 26
        }

        function randomBuyCountForExtraDelay() {
            return Math.floor(Math.random() * (8 - 4 + 1)) + 4; // Random number between 4 and 8 buys for extra delay
        }
        
        let startedBuying = false;
        let buysSinceLastDelay = 0;
        let buysUntilExtraDelay = randomBuyCountForExtraDelay();
        
        function buyExtraHotdogs() {
            let hotdogCount = randomHotdogCount();
            let currentHotdog = 0;

            function saveForLater() {
                const saveButton = document.querySelector(".close-dialog");
                if (saveButton) {
                    saveButton.click();
                    console.log(`Extra hotdog ${currentHotdog + 1} saved for later.`);
                }

                currentHotdog++;
                buysSinceLastDelay++;

                if (currentHotdog < hotdogCount) {
                    if (buysSinceLastDelay >= buysUntilExtraDelay) {
                        console.log(`Applying extra delay after ${buysSinceLastDelay} buys.`);
                        buysSinceLastDelay = 0;
                        buysUntilExtraDelay = randomBuyCountForExtraDelay(); // Set new random value for next extra delay
                        setTimeout(buyNextHotdog, extraDelay()); // Apply extra delay
                    } else {
                        setTimeout(buyNextHotdog, randomDelay()); // Regular delay
                    }
                } else {
                    console.log(`All ${hotdogCount} hotdogs have been bought and saved for later.`);
                }
            }

            function buyNextHotdog() {
                const buyButton = document.querySelector("input[value='Buy!']");
                if (buyButton) {
                    buyButton.click();
                    console.log(`Extra hotdog ${currentHotdog + 1} bought.`);
                    setTimeout(saveForLater, randomDelay());
                }
            }

            buyNextHotdog();
        }
        
        document.querySelector("input[value='Buy!']").addEventListener('click', function() {
            if (!startedBuying) {
                startedBuying = true;

                setTimeout(function() {
                    const saveButton = document.querySelector(".close-dialog");
                    if (saveButton) {
                        saveButton.click();
                        console.log('First hotdog saved for later. Now buying extra hotdogs...');
                        setTimeout(buyExtraHotdogs, randomDelay());
                    }
                }, randomDelay());
            }
        });
        
    });
});
