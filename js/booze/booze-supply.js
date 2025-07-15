document.addEventListener('DOMContentLoaded', async function () {
    $(document).ready(function () {

        // Create supply mode buttons
        const supplyModeOn = $('<span id="supply-on" style="cursor:pointer; color:green; font-weight:bold; margin-right: 10px;">Supply Mode ON</span>');
        const supplyModeOff = $('<span id="supply-off" style="cursor:pointer; color:red; font-weight:bold;">Supply Mode OFF</span>');

        // Append buttons to the third .sub3 element
        function appendButtonsToThirdSub3() {
            const thirdSub3 = $('.sub3').eq(2); // Select the 3rd .sub3 element (0-based index)
            if (thirdSub3.length) {
                const buttonContainer = $('<div style="text-align: left;"></div>'); // Container for left alignment
                buttonContainer.append(supplyModeOn).append(supplyModeOff);
                thirdSub3.append(buttonContainer);
                console.log('Supply Mode buttons appended to the third .sub3 element.');
            }
        }

        // Extract the "Safe to travel with" value from the HTML
        function getSafeToTravelWith() {
            const safeToTravelElement = $('.info-display .title:contains("Safe to travel with:")')
                .next('.description')
                .find('.attribute-gym-color');
            if (safeToTravelElement.length) {
                const safeToTravelText = safeToTravelElement.text().trim();
                let safeToTravel = parseInt(safeToTravelText.replace(/[^0-9]/g, ''), 10);

                if (safeToTravel === 3240) {
                    console.log(`Safe to travel with value is 3240. Replacing it with 3256.`);
                    safeToTravel = 3256;
                } else {
                    console.log(`Safe to travel with: ${safeToTravel} crates`);
                }

                return safeToTravel;
            } else {
                console.warn('Safe to travel with value not found.');
                return 0;
            }
        }

        // Supply Mode toggle logic
        let supplyMode = localStorage.getItem('supplyMode') === 'true'; // Default is false

        function toggleSupplyMode() {
            supplyMode = !supplyMode;
            localStorage.setItem('supplyMode', supplyMode);
            console.log(`Supply Mode is now ${supplyMode ? 'ENABLED' : 'DISABLED'}`);

            if (supplyMode) {
                console.log('Supply Mode turned ON. Starting routine...');
                startRoutine();
            } else {
                console.log('Supply Mode turned OFF. Redirecting to bootlegging page...');
                window.location.href = "https://www.bootleggers.us/bootlegging.php";
            }
        }

        // Append Supply Mode checkbox to the third .sub3 element
        function appendSupplyModeCheckbox() {
            const thirdSub3 = $('.sub3').eq(2); // Select the 3rd .sub3 element (0-based index)
            if (thirdSub3.length) {
                const checkboxContainer = $('<div style="text-align: left; margin-bottom: 5px;"></div>');

                // Create the Supply Mode checkbox
                const supplyModeCheckbox = $('<input>', {
                    type: 'checkbox',
                    id: 'supplyModeCheckbox',
                    checked: supplyMode,
                    change: toggleSupplyMode
                });

                const supplyModeLabel = $('<label>', {
                    for: 'supplyModeCheckbox',
                    text: ' Resupply Mode | Enabled Cities '
                });

                // Append the checkbox
                checkboxContainer.append(supplyModeCheckbox).append(supplyModeLabel);

                // Append cosmetic CIN checkbox (checked and disabled)
                const cinCheckbox = $('<input>', {
                    type: 'checkbox',
                    id: 'cinCheckbox',
                    checked: true,
                    disabled: true
                });
                const cinLabel = $('<label>', {
                    for: 'cinCheckbox',
                    text: ' CIN'
                });
                checkboxContainer.append(' ').append(cinCheckbox).append(cinLabel);

                // Create city-specific checkboxes (NYC, RM, CHI, NO, AC, DT) with defaults
                const cityOptions = [
                    { key: 'NYC', label: 'NYC', default: true },
                    { key: 'RM', label: 'RM', default: true },
                    { key: 'CHI', label: 'CHI', default: true },
                    { key: 'NO', label: 'NO', default: false },
                    { key: 'AC', label: 'AC', default: false },
                    { key: 'DT', label: 'DT', default: false },
                ];

                cityOptions.forEach(city => {
                    let storedValue = localStorage.getItem('enableCity_' + city.key);
                    if (storedValue === null) {
                        // If never stored, set default
                        localStorage.setItem('enableCity_' + city.key, city.default ? 'true' : 'false');
                        storedValue = city.default ? 'true' : 'false';
                    }

                    const cityCheckbox = $('<input>', {
                        type: 'checkbox',
                        id: 'cityCheck_' + city.key,
                        change: function () {
                            const isChecked = $(this).is(':checked');
                            localStorage.setItem('enableCity_' + city.key, isChecked ? 'true' : 'false');
                            console.log(`City ${city.key} set to ${isChecked}`);
                        }
                    }).prop('checked', storedValue === 'true');

                    const cityLabel = $('<label>', {
                        for: 'cityCheck_' + city.key,
                        text: ' ' + city.label + ' '
                    });

                    // Add spacing and append to container
                    checkboxContainer.append(' ').append(cityCheckbox).append(cityLabel);
                });

                thirdSub3.append(checkboxContainer);
                console.log('Supply Mode checkbox appended to the third .sub3 element.');
            }
        }

        $(document).on('click', '#supply-on', function () {
            supplyMode = true;
            localStorage.setItem('supplyMode', 'true'); // Save state to localStorage
            console.log('Supply Mode turned ON. Starting routine...');
            startRoutine();
        });

        $(document).on('click', '#supply-off', function () {
            supplyMode = false;
            localStorage.setItem('supplyMode', 'false'); // Save state to localStorage
            console.log('Supply Mode turned OFF. Stopping routine...');
            window.location.href = "https://www.bootleggers.us/bootlegging.php";
        });

        async function startRoutine() {
            if (!supplyMode) {
                console.log("Supply Mode is DISABLED. Routine will not start.");
                return;
            }

            // Check for a spike
            if (checkForSpike()) {
                console.log('Spike detected. Pausing the process temporarily.');
                return false; // Exit the routine and wait for the page refresh
            }

            console.log('Waiting 1.5 seconds before starting the grab car routine...');
            await wait(1500); // Wait for 1.5 seconds

            console.log('Triggering get first best car...');
            await waitForElement('.get-first-best'); // Wait until the .get-first-best element is available

            const firstBestCar = $('.get-first-best'); // Select the first best car button
            console.log('Checking for .get-first-best button presence...');

            // Check if the car already has the right booze
            const carBoozeCrates = $('.BL-content-inner-box.crates-box .booze-crates');
            let hasRightBooze = false;

            // Get the current city name
            const cityName = $('.city-name').text().trim();

            // Get booze with the highest current production and <150 value, excluding specific booze types based on the city
            const boozeWithHighestProduction = $('.booze-cell').filter(function () {
                const boozeId = $(this).data('booze-id');
                const boozeLabel = $(this).find('.name').text().trim(); // Get the booze name
                const boozeValue = getBoozeValue(boozeId);

                // Exclude specific booze types based on city
                if (
                    (cityName === "New York City" && boozeLabel === "Beer") ||
                    (cityName === "New Orleans" && boozeLabel === "Bourbon")
                ) {
                    console.log(`Excluding ${boozeLabel} in ${cityName} from consideration.`);
                    return false;
                }

                return boozeValue < 150;
            }).toArray().reduce((highest, cell) => {
                const boozeId = $(cell).data('booze-id');
                const productionLabel = $(cell).find('.BL-progress-bar .label').text().trim();
                const currentProduction = parseInt(productionLabel.split('/')[0].replace(/[^0-9]/g, ''), 10);

                if (!highest || currentProduction > highest.production) {
                    return { id: boozeId, production: currentProduction, name: $(cell).find('.name').text().trim() };
                }
                return highest;
            }, null);

            if (boozeWithHighestProduction) {
                carBoozeCrates.each(function () {
                    const boozeId = $(this).data('booze-id'); // Get the booze ID
                    const boozeName = $(this).find('.name').text().trim(); // Get the booze name

                    if (boozeId === boozeWithHighestProduction.id) {
                        console.log(
                            `Car already has the right booze: ${boozeName} with highest production (${boozeWithHighestProduction.production})`
                        );
                        hasRightBooze = true;
                        return false; // Exit the loop early
                    }
                });
            }

            if (hasRightBooze) {
                console.log('Skipping .get-first-best click because the car already has the right booze.');
            } else if (firstBestCar.length) {
                console.log('.get-first-best button found. Waiting briefly before triggering...');
                await wait(500); // Wait for 500ms to ensure the button is fully initialized

                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                });
                firstBestCar[0].dispatchEvent(clickEvent); // Simulate a native click
                console.log('Successfully triggered get first best car using native click event.');
            } else {
                console.warn('Element .get-first-best not found. Cannot proceed.');
            }

            console.log('Waiting for 75 seconds...');
            await wait(75000);

            // Check car capacity before proceeding
            const carCapacity = getCarCapacity();
            if (carCapacity >= 1750) {
                console.log(`Car capacity (${carCapacity}) is sufficient. Proceeding with routine.`);
                console.log('Checking and topping up the car...');
                await monitorCarAndTopUp(); // Ensure the car is topped up first

                console.log('Monitoring for drive readiness...');
                monitorDrive();
            } else {
                console.warn(`Car capacity (${carCapacity}) is insufficient. Skipping further routine.`);
            }
        }

        // Function to get the booze value based on its ID
        function getBoozeValue(boozeId) {
            const divText = $(`.booze-price.booze-${boozeId}`).text().trim();
            const prunedText = divText.replace(/[^0-9]/g, '');
            return parseInt(prunedText, 10) || 0;
        }

        // Function to extract the car's capacity from the label
        function getCarCapacity() {
            const label = $('.inventory-bar .label').text().trim(); // Format: "currentCapacity/totalCapacity"
            if (!label.includes('/')) {
                console.warn('Car capacity label format is incorrect:', label);
                return 0;
            }

            const [, maxRaw] = label.split('/').map((str) => str.trim());
            const maxCapacity = parseInt(maxRaw.replace(/[^0-9]/g, ''), 10) || 0;

            console.log(`Extracted car capacity: ${maxCapacity}`);
            return maxCapacity;
        }

        async function waitForElement(selector, timeout = 10000) {
            const interval = 500; // Check every 500ms
            const startTime = Date.now();

            while (Date.now() - startTime < timeout) {
                if ($(selector).length) {
                    console.log(`Element ${selector} is available.`);
                    return;
                }
                await wait(interval); // Wait and retry
            }

            console.warn(`Element ${selector} not found within ${timeout}ms.`);
        }

        function checkForSpike() {
            const currentCity = $('.city-name').text().trim(); // Fetch the current city from the DOM
            let highestSpike = null;

            if (currentCity === 'Chicago' || currentCity === 'Cincinnati') {
                console.log(`Checking for spikes in ${currentCity}...`);

                $('.booze-cell').each(function () {
                    const boozeId = $(this).data('booze-id'); // Get the booze ID
                    const boozeName = $(this).find('.name').text().trim(); // Get the booze name
                    const divText = $(this).find('.booze-price').text().trim(); // Get the price text
                    const prunedText = divText.replace(/[^0-9]/g, '');
                    const boozeValue = parseInt(prunedText, 10); // Parse the booze value

                    // Check spike conditions based on the city and booze name
                    if (
                        (currentCity === 'Cincinnati' && boozeValue > 1750) || // Any spike in Cincinnati
                        (currentCity === 'Chicago' && boozeName === 'Bourbon' && boozeValue > 1750) // Bourbon spike in Chicago
                    ) {
                        if (!highestSpike || boozeValue > highestSpike.value) {
                            highestSpike = {
                                id: boozeId,
                                name: boozeName,
                                value: boozeValue
                            };
                        }
                    }
                });

                if (highestSpike) {
                    console.log(`Spike detected in ${currentCity}! Booze: ${highestSpike.name}, ID: ${highestSpike.id}, Value: ${highestSpike.value}`);
                    return true; // Spike detected
                }

                console.log(`No spike detected in ${currentCity}.`);
            } else {
                //console.log(`Spike checks are not applicable in ${currentCity}.`);
            }

            return false; // No spike detected or not applicable
        }

        // Wait function
        function wait(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        // Monitor drive readiness based on the timer itself
        function monitorDrive() {
            const interval = setInterval(async () => {
                if (!supplyMode) {
                    clearInterval(interval);
                    console.log('Routine stopped. Exiting monitor.');
                    return;
                }

                // Check for a spike
                if (checkForSpike()) {
                    console.log('Spike detected. Pausing the process temporarily.');
                    clearInterval(interval); // Stop the monitor loop
                    return; // Exit the routine and wait for the page refresh
                }

                // Check the timer display
                const driveTimer = $('#timer-dri .BL-timer-display');
                if (driveTimer.length) {
                    const timerText = driveTimer.text().trim(); // Format: HH:MM:SS
                    const [hours, minutes, seconds] = timerText.split(':').map(Number);
                    const remainingTime = (hours * 3600 + minutes * 60 + seconds) * 1000; // Convert to milliseconds

                    if (remainingTime <= 0) {
                        console.log('Drive timer hit 0. Checking car readiness...');

                        // Check car readiness before driving
                        const isCarReady = await monitorCarAndTopUp(); // Ensures car is topped up to safe threshold
                        if (isCarReady) {
                            console.log('Car is ready. Initiating drive...');
                            clearInterval(interval); // Stop the monitor loop
                            await startDriving(); // Proceed with driving
                        } else {
                            console.log('Car is not yet ready. Retrying top-up...');
                        }
                    } else {
                        console.log(`Drive will be ready in ${remainingTime / 1000} seconds. Waiting...`);
                    }
                } else {
                    console.warn('Drive timer not found.');
                }
            }, 5000); // Check every 5 seconds
        }

        // Get the available booze in the car
        function getCarBoozeCapacity() {
            const label = $('.bottom .inventory-bar .label').text().trim();

            if (!label.includes('/')) {
                console.log("Car capacity label format incorrect:", label);
                return { current: 0, max: 0 };
            }

            const [currentRaw, maxRaw] = label.split('/').map(str => str.trim());
            const current = parseInt(currentRaw.replace(/[^0-9]/g, ''), 10) || 0;
            const max = parseInt(maxRaw.replace(/[^0-9]/g, ''), 10) || 0;

            // Debugging output
            console.log(`Parsed car capacity: current = ${current}, max = ${max}`);
            return { current, max };
        }

        let lastTopUpAttempt = 0;

        async function monitorCarAndTopUp() {
            // Check for a spike
            if (checkForSpike()) {
                console.log('Spike detected. Pausing the process temporarily.');
                return false; // Exit the routine and wait for the page refresh
            }

            const now = Date.now();
            if (now - lastTopUpAttempt < 8000) { // 8-seconds cooldown
                console.log('Cooldown active. Skipping top-up attempt.');
                return false;
            }

            lastTopUpAttempt = now; // Update last attempt timestamp

            const { current: carBoozeLevel, max: carMaxCapacity } = getCarBoozeCapacity(); // Fetch current and max booze level
            const safeToTravel = getSafeToTravelWith(); // Fetch the "Safe to travel with" value

            // Check if the car is full (current equals max capacity)
            if (carBoozeLevel >= carMaxCapacity) {
                console.log(`Car is already full (${carBoozeLevel}/${carMaxCapacity}). No need to top up.`);
                return true; // Car is ready
            }

            // Check if the car is below the safe threshold
            if (carBoozeLevel < safeToTravel) {
                console.log(`Car booze level (${carBoozeLevel}) is below the safe threshold (${safeToTravel}).`);
                const topUpMostButton = $('.top-up-most-button');

                if (topUpMostButton.length) {
                    console.log(`Topping up the car towards the safe threshold (${safeToTravel})...`);
                    topUpMostButton.trigger('click'); // Ensure the car is filled only up to the safe limit
                    await wait(5000); // Wait for the top-up action to complete
                    return await monitorCarAndTopUp(); // Recheck after top-up
                } else {
                    console.warn('No top-up buttons available. Cannot proceed.');
                    return false;
                }
            } else {
                console.log(`Car booze level (${carBoozeLevel}) meets or exceeds the safe threshold (${safeToTravel}).`);
                return true; // Car is ready
            }
        }

        // Start driving using fetch
        async function startDriving() {
            try {
                // Get the car booze level and safe-to-travel threshold
                const { current: carBoozeLevel } = getCarBoozeCapacity();
                const safeToTravel = getSafeToTravelWith();

                if (carBoozeLevel > safeToTravel) {
                    console.warn(`Cannot start driving. Car booze level (${carBoozeLevel}) is below the safe threshold (${safeToTravel}).`);
                    return; // Exit the function if the car is not ready
                }

                console.log(`Car booze level (${carBoozeLevel}) meets the safe threshold (${safeToTravel}). Proceeding with driving...`);

                // Get the current city name
                const cityName = $('.city-name').text().trim();

                // Define the city-to-ID mapping
                const cityToIdMap = {
                    "New York City": 3,
                    "New Orleans": 3,
                    "Rocky Mount": 3,
                    "Atlantic City": 3,
                    "Detroit": 3,
                    "Chicago": 3,
                    "Cincinnati": 1
                };

                // Get the city ID based on the current city
                const cityId = cityToIdMap[cityName] || null;

                if (!cityId) {
                    console.error(`City ID for ${cityName} not found. Cannot proceed with driving.`);
                    return;
                }

                // Prepare the request body
                const formData = new URLSearchParams({
                    use_certificate: "1",
                    travel_city_id: cityId.toString(),
                    travel_method: "drive"
                });

                // Perform the fetch
                const response = await fetch("https://www.bootleggers.us/ajax/travel.php?action=drive", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "X-Requested-With": "XMLHttpRequest",
                        "Accept": "*/*",
                        "Referer": "https://www.bootleggers.us/travel.php",
                        "Origin": "https://www.bootleggers.us"
                    },
                    body: formData.toString(),
                    credentials: "include" // To include cookies like PHPSESSID
                });

                if (!response.ok) {
                    throw new Error(`Network response was not ok. Status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Drive initiated successfully:', data);

                console.log('Refreshing the page in 10 seconds...');
                setTimeout(() => {
                    location.reload();
                }, 10000);
            } catch (error) {
                console.error('Error starting drive:', error);
            }
        }

        function restoreSupplyMode() {
            const savedState = localStorage.getItem('supplyMode') === 'true';
            supplyMode = savedState;

            console.log(`Supply Mode restored to ${supplyMode ? 'ON' : 'OFF'}.`);

            // Ensure the checkbox reflects the state
            $('#supplyModeCheckbox').prop('checked', supplyMode);

            if (supplyMode) {
                startRoutine(); // If Supply Mode was on before refresh, resume the routine
            }
        }

        // appendButtonsToThirdSub3(); // Append buttons on page load
        appendSupplyModeCheckbox()
        restoreSupplyMode(); // Restore state on page reload

        // Monitor train readiness and travel logic
        function monitorTrain() {
            const interval = setInterval(async () => {
                if (!supplyMode) {
                    clearInterval(interval);
                    console.log('Routine stopped. Exiting train monitor.');
                    return;
                }

                // Check for a spike
                if (checkForSpike()) {
                    console.log('Spike detected. Pausing the process temporarily.');
                    clearInterval(interval); // Stop the monitor loop
                    return; // Exit the routine and wait for the page refresh
                }

                // Check the train timer display
                const trainTimer = $('#timer-tra .BL-timer-display');
                const driveTimer = $('#timer-dri .BL-timer-display'); // Add drive timer check

                if (trainTimer.length && driveTimer.length) {
                    const trainTimerText = trainTimer.text().trim(); // Train timer in HH:MM:SS format
                    const driveTimerText = driveTimer.text().trim(); // Drive timer in HH:MM:SS format

                    const [trainHours, trainMinutes, trainSeconds] = trainTimerText.split(':').map(Number);
                    const trainRemainingTime = (trainHours * 3600 + trainMinutes * 60 + trainSeconds) * 1000;

                    const [driveHours, driveMinutes, driveSeconds] = driveTimerText.split(':').map(Number);
                    const driveRemainingTime = (driveHours * 3600 + driveMinutes * 60 + driveSeconds) * 1000;

                    // Only start train travel if drive timer is within 10 minutes of readiness
                    if (driveRemainingTime <= 10 * 60 * 1000 && trainRemainingTime <= 0) {
                        clearInterval(interval); // Stop the monitor loop
                        await startTrainTravel(); // Proceed with train travel
                    } else {
                        console.log(
                            `Train will be ready in ${trainRemainingTime / 1000} seconds. ` +
                            `Drive will be ready in ${driveRemainingTime / 1000} seconds. Waiting...`
                        );
                    }
                } else {
                    console.warn('Train or drive timer not found.');
                }
            }, 5000); // Check every 5 seconds
        }

        async function startTrainTravel() {
            try {
                // Only allow train travel from Cincinnati, etc.
                const currentCity = $('.city-name').text().trim();
                if (currentCity !== "Cincinnati") {
                    console.warn(`Train travel is only allowed from Cincinnati. Current city: ${currentCity}`);
                    return;
                }

                console.log("Starting train travel from Cincinnati...");

                // Build a complete list of booze cells with production values
                let boozeList = [];
                $('.booze-cell').each(function () {
                    const boozeName = $(this).find('.name').text().trim();
                    const labelText = $(this).find('.BL-progress-bar .label').text().trim();
                    const production = parseInt(labelText.split('/')[0].replace(/[^0-9]/g, ''), 10) || 0;
                    boozeList.push({ name: boozeName, production });
                });

                if (!boozeList.length) {
                    console.error('No booze found for train travel.');
                    return;
                }

                // Sort the list in descending order of production
                boozeList.sort((a, b) => b.production - a.production);

                // Modified helper: return the destination only if its checkbox is enabled.
                function getDestinationForBooze(boozeName) {
                    switch (boozeName) {
                        case "Moonshine":
                            return (localStorage.getItem('enableCity_RM') === 'true') ? "RM" : null;
                        case "Gin":
                            const nycEnabled = localStorage.getItem('enableCity_NYC') === 'true';
                            const acEnabled = localStorage.getItem('enableCity_AC') === 'true';
                            if (nycEnabled && acEnabled) {
                                return Math.random() < 0.5 ? "NYC" : "AC";
                            } else if (nycEnabled) {
                                return "NYC";
                            } else if (acEnabled) {
                                return "AC";
                            }
                            return null;
                        case "Rum":
                            return (localStorage.getItem('enableCity_NO') === 'true') ? "NO" : null;
                        case "Whiskey":
                            const chiEnabled = localStorage.getItem('enableCity_CHI') === 'true';
                            const dtEnabled = localStorage.getItem('enableCity_DT') === 'true';
                            if (chiEnabled && dtEnabled) {
                                return "DT";
                            } else if (chiEnabled) {
                                return "CHI";
                            } else if (dtEnabled) {
                                return "DT";
                            }
                            return null;
                        case "Beer":
                            return (localStorage.getItem('enableCity_CHI') === 'true') ? "CHI" : null;
                        default:
                            return null;
                    }
                }

                // Iterate through the sorted list and pick the first booze whose destination is enabled
                let chosen = null;
                for (let i = 0; i < boozeList.length; i++) {
                    const candidate = boozeList[i];
                    const dest = getDestinationForBooze(candidate.name);
                    if (dest !== null) {
                        chosen = { booze: candidate.name, cityKey: dest, production: candidate.production };
                        break;
                    }
                }
                if (!chosen) {
                    console.warn('No enabled city matches any booze. Aborting train travel.');
                    return;
                }

                console.log(`Chosen Booze: ${chosen.booze}, traveling to city key: ${chosen.cityKey}`);

                // Step 3: Convert city key (NYC, RM, CHI, NO, AC, DT) to the correct city ID
                const cityToIdMap = {
                    "CHI": 1,
                    "RM": 8,
                    "NYC": 4,
                    "NO": 5,
                    "AC": 6,
                    "DT": 2,
                };

                const cityId = cityToIdMap[chosen.cityKey];
                if (!cityId) {
                    console.error(`No city ID found for key ${chosen.cityKey}. Cannot travel.`);
                    return;
                }

                // Prepare the request body
                const formData = new URLSearchParams({
                    use_certificate: "1",
                    travel_city_id: cityId.toString(),
                    travel_method: "train"
                });

                // Perform the fetch to travel by train
                const response = await fetch("https://www.bootleggers.us/ajax/travel.php?action=drive", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "X-Requested-With": "XMLHttpRequest",
                        "Accept": "*/*",
                        "Referer": "https://www.bootleggers.us/travel.php",
                        "Origin": "https://www.bootleggers.us"
                    },
                    body: formData.toString(),
                    credentials: "include"
                });

                if (!response.ok) {
                    throw new Error(`Network response was not ok. Status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Train travel initiated successfully:', data);

                console.log('Refreshing the page in 10 seconds...');
                setTimeout(() => {
                    location.reload();
                }, 10000);
            } catch (error) {
                console.error('Error starting train travel:', error);
            }
        }
        monitorTrain();
    });
});
