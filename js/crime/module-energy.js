document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        const ENERGY_MIN = parseInt(localStorage.getItem('refillMin')) || 0;
        const ENERGY_MAX = parseInt(localStorage.getItem('refillMax')) || 170;
        const OC_SECONDS = parseInt(localStorage.getItem('enableOcSeconds')) || 16200;
        const START_BANANA_BUY = parseInt(localStorage.getItem('startBananaBuy')) || 30;
        const BEER_ID = "141";
        const COFFEE_IDS = ["30", "9"];
        const BANANA_ID = "53";
        const APPLE_ID = "99";
        const NYC_URL = "https://www.bootleggers.us/speakeasy/?id=3";
        const AC_URL = "https://www.bootleggers.us/speakeasy/?id=5";
        const RM_URL = "https://www.bootleggers.us/speakeasy/?id=4";
        let coffeeTimerActive = false;
        let bananaTimerActive = false;
        let appleTimerActive = false;
        let skipConsumeCheckCount = 0;
        let skipMenu = false;
        let feastStartInProgress = false;

        function monitorEnergy() {
            const cityName = $('.city-name').text().trim();
            const energy = getCurrentEnergy();

            // First, handle active meal biting logic before any other actions
            const mealIcon = document.querySelector('.meal-icon');
            const activeMeal = document.querySelector('.BL-meal .meal-item.served');
            const finishedMeal = document.querySelector('.BL-meal .meal-item.served.removed');
            const biteButton = document.querySelector('.BL-meal .bite-button');
            const startButton = document.querySelector('.BL-meal .start-button');
            
            // If meal is finished, refresh page
            if (finishedMeal) {
                console.log("Meal completed. Refreshing...");
                window.location.href = "https://www.bootleggers.us/crimes.php";
                return;
            }

            if (activeMeal && !finishedMeal) {
                setTimeout(() => {
                    mealIcon.click();
                }, 1000); // Wait for the meal icon to be clicked

                const progress = parseInt(activeMeal.getAttribute('data-progress'), 10) || 0;

                // If progress is 0, meal hasn't started yet
                if (progress === 0 && startButton && startButton.offsetParent !== null && !feastStartInProgress) {
                    startButton.click();
                    feastStartInProgress = true;
                    console.log("Feast started.");
                    setTimeout(() => {
                        feastStartInProgress = false; // allow checking again later if needed
                        monitorEnergy();
                    }, 3000); // Wait a bit longer for DOM to update
                    return;
                }

                if (energy >= ENERGY_MIN && energy < ENERGY_MAX) {
                    if (biteButton && !biteButton.disabled && biteButton.offsetParent !== null) {
                        biteButton.click();
                        console.log("Bite taken from the meal. Current energy:", energy);
                    } else {
                        console.log("Bite button not available or not ready.");
                    }
                } else {
                    console.log(`Energy (${energy}) at or above threshold (${ENERGY_MAX}), holding off next bite.`);
                }

                // Retry this cycle after short delay (faster loop)
                setTimeout(monitorEnergy, getRandomInt(3000, 3500));
                return;
            }

            if (energy >= ENERGY_MIN && energy < ENERGY_MAX) {
                console.log("Energy is below set threshold. Starting checks...");

                // Try eating at Rocco's if eligible before any other energy actions
                const enableRocco = (localStorage.getItem('enableRocco') || 'false') === 'true';
                const city = $('.city-name').text().trim();
                const currentHour = new Date().getHours();
                const stuffedTimerActive = isTimerActive("52");
                const feastOngoing = document.querySelector('.BL-meal') !== null;

                if (
                    enableRocco &&
                    city === "New York City" &&
                    currentHour >= 11 && currentHour <= 22 &&
                    !stuffedTimerActive &&
                    !feastOngoing
                ) {
                    const timerElement = document.querySelector('#timer-org .BL-timer-display');
                    if (timerElement) {
                        const ocSeconds = parseTimerStringToSeconds(timerElement.textContent.trim());
                        if (ocSeconds > OC_SECONDS) {
                            console.log("Conditions met for Rocco dinner. Starting meal...");

                            fetch("https://www.bootleggers.us/ajax/meal.php?action=start", {
                                method: "POST",
                                headers: {
                                    "Accept": "*/*",
                                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                                    "Referer": "https://www.bootleggers.us/speakeasy/?id=6",
                                    "X-Requested-With": "XMLHttpRequest"
                                },
                                body: new URLSearchParams({
                                    "course[2]": "16",
                                    "speakeasy_id": "6",
                                    "meal_id": "3"
                                })
                            })
                                .then(response => response.json())
                                .then(data => {
                                    console.log("Rocco meal started:", data);
                                    window.location.href = "https://www.bootleggers.us/crimes.php";
                                })
                                .catch(error => console.error("Failed to start Rocco meal:", error));

                            return; // Skip further checks for this cycle
                        } else {
                            console.log("OC timer is below threshold hours. Skipping Rocco meal.");
                        }
                    } else {
                        console.log("OC timer not found. Skipping Rocco meal.");
                    }
                } else {
                    console.log("Rocco meal conditions not met or already in progress.");
                }

                if (isTimerActive("76")) { // Beer timer active
                    console.log("Beer timer active. Checking consumables...");
                    if (skipConsumeCheckCount === 0 && !bananaTimerActive && !coffeeTimerActive && !appleTimerActive && !isTimerActive("23")) {
                        console.log("Consume timer inactive. Go to items...");
                        consumeBanana();
                    } else if (skipConsumeCheckCount > 0) {
                        console.log(`Skipping coffee check (${skipConsumeCheckCount} remaining).`);
                        skipConsumeCheckCount--;
                    } else {
                        console.log("Coffee timer active or script timer pending. Waiting...");
                    }
                } else {
                    console.log("Beer timer inactive. Checking city or drinking beer...");
                    if (isInCity(cityName)) {
                        console.log(`Energy is low in ${cityName}. Navigating to Speakeasy...`);
                        navigateToCitySpeakeasy(cityName);
                    } else {
                        console.log("Not in a specific city. Attempting to drink beer...");
                        if (localStorage.getItem('enableBeer') === 'true' && !drinkBeer()) {
                            console.log("No beer available. Checking for consumables...");
                            if (skipConsumeCheckCount === 0 && !bananaTimerActive && !coffeeTimerActive && !appleTimerActive && !isTimerActive("23")) {
                                console.log("Consume timer inactive. Go to items...");
                                consumeBanana();
                            } else if (skipConsumeCheckCount > 0) {
                                console.log(`Skipping coffee check (${skipConsumeCheckCount} remaining).`);
                                skipConsumeCheckCount--;
                            } else {
                                console.log("Coffee or banana timer active or script timer pending. Waiting...");
                            }
                        }
                    }
                }
            } else {
                console.log("Energy level is sufficient or out of range.");
            }

            setTimeout(monitorEnergy, getRandomInt(9000, 12000));
        }
        monitorEnergy();

        function isInCity(cityName) {
            return cityName === "New York City" || cityName === "Atlantic City" || cityName === "Rocky Mount";
        }

        function navigateToCitySpeakeasy(cityName) {
            let speakeasyURL;

            if (cityName === "New York City" && localStorage.getItem('autoDrinkNYC') === 'true') {
                speakeasyURL = NYC_URL;
            } else if (cityName === "Atlantic City" && localStorage.getItem('autoDrinkAC') === 'true') {
                speakeasyURL = AC_URL;
            } else if (cityName === "Rocky Mount" && localStorage.getItem('autoDrinkRM') === 'true') {
                speakeasyURL = RM_URL;
            } else {
                console.log("City not recognized. No action taken.");
                return;
            }

            console.log(`Navigating to Speakeasy in ${cityName}...`);
            setTimeout(() => {
                window.location.href = speakeasyURL;
            }, getRandomInt(3000, 4000));
        }

        function getCurrentEnergy() {
            const energyBar = document.querySelector('.BL-energy-bar[data-type="1"] .label');
            return energyBar ? parseInt(energyBar.textContent.split('/')[0], 10) || 0 : 0;
        }

        function isTimerActive(timerId) {
            const timerElement = document.querySelector(`.player-effects .BL-effect[data-id="${timerId}"]`);
            const parentDiv = timerElement?.closest('.effect.BL-timer');
            const timeLeft = parentDiv?.querySelector('.BL-timer-display.timeleft')?.textContent.trim();
            return parentDiv?.classList.contains('BL-timer-active') && timeLeft !== "0s";
        }

        function drinkBeer() {
            const beerElement = document.querySelector(`.BL-item.no-info[data-id="${BEER_ID}"]`);
            if (beerElement) {
                beerElement.click();
                console.log("Beer consumed to refill energy.");
                return true;
            } else {
                console.log("No beer available.");
                return false;
            }
        }

        async function consumeBanana() {
            // Keep the Referer for the `fetch` call
            const Referer = window.location.href;
            console.log(`Using Referer: ${Referer} for coffee/banana consumption.`);

            // Grab the current city name
            const cityName = $('.city-name').text().trim();

            // Open the character menu first
            if (skipMenu === false) {
                const menuButton = document.querySelector('.sideBar .cat .items-shortcut');
                if (menuButton) {
                    menuButton.click();
                    console.log("Character menu opened.");
                }
                // Close character menu if it was opened
                const closeButton = document.querySelector('.icon-close.main');
                if (closeButton) {
                    closeButton.click();
                    console.log("Character menu closed.");
                }
                skipMenu = true;
            }

            setTimeout(async () => {
                // Look for items in the inventory
                const Items = document.querySelectorAll('.items .item .BL-item.no-info');
                const coffeeItems = Array.from(Items).filter(item => COFFEE_IDS.includes(item.getAttribute('data-id')));
                const bananaItems = Array.from(Items).filter(item => BANANA_ID.includes(item.getAttribute('data-id')));
                const appleItems = Array.from(Items).filter(item => APPLE_ID.includes(item.getAttribute('data-id')));

                // -------------------------------------------------------------
                // 1) CHECK BANANA COUNT BEFORE CONSUMPTION
                // -------------------------------------------------------------
                if (
                    localStorage.getItem('enableBananaBuy') === 'true' &&
                    bananaItems.length < START_BANANA_BUY &&
                    cityName === "Atlantic City"
                ) {
                    // Then check if there's enough carrying space
                    const carryingSpan = document.querySelector('.carrying span:first-child');
                    const limitSpan = document.querySelector('.carrying span:last-child');

                    if (carryingSpan && limitSpan) {
                        const carrying = parseInt(carryingSpan.textContent.trim(), 10);
                        const carryLimit = parseInt(limitSpan.textContent.trim(), 10);
                        let availableSpace = carryLimit - carrying - 30;
                        if (availableSpace < 0) availableSpace = 0;

                        if (availableSpace === 0) {
                            console.log("Not enough space to buy bananas (30 slots required). Skipping gym navigation.");
                            return;
                        }
                    }

                    console.log("Fewer than 30 bananas in Atlantic City. Navigating to gym...");
                    window.location.href = "https://www.bootleggers.us/gym.php";
                    return; // Important to stop further execution
                } else {
                    console.log("Fewer than 30 bananas, or not in Atlantic City. Cannot go to gym. Continuing...");
                }

                // -------------------------------------------------------------
                // 2) CHECK APPLE/COFFEE/BANANA COUNT BEFORE CONSUMPTION
                // -------------------------------------------------------------
                if (localStorage.getItem('enableApple') === 'true' && appleItems.length > 0) {

                    // 2-hour safeguard check
                    const sixHoursMode = (localStorage.getItem('enableApple6hrs') === 'true');
                    const fourHoursMode = (localStorage.getItem('enableApple4hrs') === 'true');
                    const twoHoursMode = (localStorage.getItem('enableApple2hrs') === 'true');
                    const timerElement = document.querySelector('#timer-org .BL-timer-display');
                    if (timerElement) {
                        const ocSeconds = parseTimerStringToSeconds(timerElement.textContent.trim());

                        // NEW: Skip if the OC timer is 0 or "Ready"
                        if (ocSeconds <= 0) {
                            console.log("OC timer is 0 or Ready. Skipping apple consumption entirely.");
                            return;
                        }

                        if (sixHoursMode && ocSeconds < 21600) {
                            console.log("OC timer is below 6 hours. Skipping apple consumption (6-hour safeguard).");
                            return; // do NOT consume the apple
                        }

                        if (fourHoursMode && ocSeconds < 14400) {
                            console.log("OC timer is below 4 hours. Skipping apple consumption (4-hour safeguard).");
                            return; // do NOT consume the apple
                        }

                        if (twoHoursMode && ocSeconds < 7200) {
                            console.log("OC timer is below 2 hours. Skipping apple consumption (2-hour safeguard).");
                            return; // do NOT consume the apple
                        }
                    }

                    appleItems.sort((a, b) => {
                        const idA = parseInt(a.getAttribute('data-player-item-id'));
                        const idB = parseInt(b.getAttribute('data-player-item-id'));
                        return idA - idB;
                    });

                    const lowestItem = appleItems[0];
                    const playerItemId = lowestItem.getAttribute('data-player-item-id');

                    try {
                        const response = await fetch("https://www.bootleggers.us/ajax/player.php?action=use-item", {
                            method: "POST",
                            headers: {
                                "Accept": "*/*",
                                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                                "Referer": Referer,
                                "X-Requested-With": "XMLHttpRequest"
                            },
                            body: new URLSearchParams({ "item_id": playerItemId })
                        });

                        const data = await response.json();
                        console.log(`Apple consumed (item_id ${playerItemId}):`, data);

                        skipConsumeCheckCount = 0; // reset
                        skipMenu = false;
                        setNextAppleTime();
                    } catch (error) {
                        console.error(`Error consuming Apple (item_id ${playerItemId}):`, error);
                    }
                } else {
                    // No bananas? Try coffee items or skip
                    if (localStorage.getItem('enableCoffee') === 'true' && coffeeItems.length > 0) {
                        coffeeItems.sort((a, b) => {
                            const idA = parseInt(a.getAttribute('data-player-item-id'));
                            const idB = parseInt(b.getAttribute('data-player-item-id'));
                            return idA - idB;
                        });

                        const lowestItem = coffeeItems[0];
                        const playerItemId = lowestItem.getAttribute('data-player-item-id');

                        try {
                            const response = await fetch("https://www.bootleggers.us/ajax/player.php?action=use-item", {
                                method: "POST",
                                headers: {
                                    "Accept": "*/*",
                                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                                    "Referer": Referer,
                                    "X-Requested-With": "XMLHttpRequest"
                                },
                                body: new URLSearchParams({ "item_id": playerItemId })
                            });

                            const data = await response.json();
                            console.log(`Coffee consumed (item_id ${playerItemId}):`, data);

                            skipConsumeCheckCount = 0; // reset
                            skipMenu = false;
                            setNextCoffeeTime();
                        } catch (error) {
                            console.error(`Error consuming coffee (item_id ${playerItemId}):`, error);
                        }
                    } else {
                        if (localStorage.getItem('enableBanana') === 'true' && bananaItems.length > 0) {
                            // Sort so we use the lowest player-item-id first
                            bananaItems.sort((a, b) => {
                                const idA = parseInt(a.getAttribute('data-player-item-id'));
                                const idB = parseInt(b.getAttribute('data-player-item-id'));
                                return idA - idB;
                            });

                            const lowestItem = bananaItems[0];
                            const playerItemId = lowestItem.getAttribute('data-player-item-id');

                            try {
                                const response = await fetch("https://www.bootleggers.us/ajax/player.php?action=use-item", {
                                    method: "POST",
                                    headers: {
                                        "Accept": "*/*",
                                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                                        "Referer": Referer,
                                        "X-Requested-With": "XMLHttpRequest"
                                    },
                                    body: new URLSearchParams({ "item_id": playerItemId })
                                });

                                const data = await response.json();
                                console.log(`Banana consumed (item_id ${playerItemId}):`, data);

                                skipConsumeCheckCount = 0; // reset
                                skipMenu = false;
                                setNextBananaTime();
                            } catch (error) {
                                console.error(`Error consuming banana (item_id ${playerItemId}):`, error);
                            }
                        } else {
                            console.warn("No consumable items banana or coffee found or apple needed. Skipping checks for 60 cycles.");
                            skipConsumeCheckCount = 60;
                        }
                    }
                }
            }, 4500);
        }

        function setNextBananaTime() {
            const randomDelay = isHalfTimersEnabled()
                ? getRandomInt(302500, 305000) // 5 min
                : getRandomInt(605000, 610000); // 10 min

            bananaTimerActive = true;

            console.log(`Next banana consumption scheduled in ${(randomDelay / 1000).toFixed(2)} seconds.`);
            setTimeout(() => {
                bananaTimerActive = false;
                if (!isTimerActive("23")) consumeBanana();
            }, randomDelay);
        }

        function setNextCoffeeTime() {
            const randomDelay = isHalfTimersEnabled()
                ? getRandomInt(605000, 610000) // 10 min
                : getRandomInt(1210000, 1220000); // 20 min
            coffeeTimerActive = true;

            console.log(`Next coffee consumption scheduled in ${(randomDelay / 1000).toFixed(2)} seconds.`);
            setTimeout(() => {
                coffeeTimerActive = false;
                if (!isTimerActive("23")) consumeBanana();
            }, randomDelay);
        }

        function setNextAppleTime() {
            const randomDelay = isHalfTimersEnabled()
                ? getRandomInt(152500, 155000) // 2.5 min
                : getRandomInt(305000, 310000); // 5 min

            appleTimerActive = true;

            console.log(`Next apple consumption scheduled in ${(randomDelay / 1000).toFixed(2)} seconds.`);
            setTimeout(() => {
                appleTimerActive = false;
                if (!isTimerActive("23")) consumeBanana();
            }, randomDelay);
        }

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        /**
         * parseTimerStringToSeconds(timeStr):
         *    Converts "HH:MM:SS" or "Ready" into total seconds. 
         *    Returns 0 if "Ready" or if timeStr is empty.
         */
        function parseTimerStringToSeconds(timeStr) {
            if (!timeStr || timeStr.toLowerCase() === "ready") return 0;
            const parts = timeStr.split(':').map(n => parseInt(n, 10));
            if (parts.length === 3) {
                const [h, m, s] = parts;
                return h * 3600 + m * 60 + s;
            }
            return 0;
        }

        function isHalfTimersEnabled() {
            const value = localStorage.getItem('enableHalfTimers');
            return value === null ? false : value === 'true';
        }
    });
});
