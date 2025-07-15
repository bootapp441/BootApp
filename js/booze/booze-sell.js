document.addEventListener('DOMContentLoaded', async function () {
    $(document).ready(async function () {
        // Global variables
        const idleDuration = 15 * 1000; // 15 seconds
        let idleTimeout;
        let idleMode = false;

        const username = getUsername(); // Extract the username

        // Helper: Get the username from the page
        function getUsername() {
            const usernameDiv = document.querySelector('.character-container .username a');
            return usernameDiv ? usernameDiv.textContent.trim().substring(0, 3) : 'unknown';
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

        // Start idle detection
        function startIdleDetection() {
            clearTimeout(idleTimeout);
            idleTimeout = setTimeout(enableIdleMode, idleDuration);
        }

        let currentRoutineTimeSlot = null; // Keeps track of the last executed time slot

        function enableIdleMode() {
            // if (isCaptchaActive()) { handleCaptchaDetected(); return; } else {
            // }
            idleMode = true;
            console.log("Idle mode enabled. Checking for spike...");
            const currentSlot = getCurrentTimeSlot();

            // Only start the routine if it's within the last 5 minutes of the slot
            if (currentSlot !== currentRoutineTimeSlot && isWithinLastFiveMinutes()) {
                currentRoutineTimeSlot = currentSlot; // Update the time slot tracker
                checkAndStartRoutine(); // Start the routine
            } else {
                console.log(`Routine skipped. Not within the last 5 minutes of time slot ${currentSlot}.`);
            }

            // Recheck every x seconds while idle mode is active
            setTimeout(() => {
                if (idleMode) {
                    enableIdleMode();
                }
            }, 5 * 1000);
        }

        // Helper function: Check if current time is within the last 5 minutes of a time slot
        function isWithinLastFiveMinutes() {
            const currentMinute = new Date().getMinutes();
            const timeInSlot = currentMinute % 20; // Minutes elapsed within the current slot (0-19)

            // Use the dynamically set start minute
            return timeInSlot >= sellingStartMinute;
        }

        function getCurrentTimeSlot() {
            const currentMinute = new Date().getMinutes();
            if (currentMinute >= 0 && currentMinute < 20) {
                return 1; // Slot 1
            } else if (currentMinute >= 20 && currentMinute < 40) {
                return 2; // Slot 2
            } else {
                return 3; // Slot 3
            }
        }

        let initialTimeSlot = getCurrentTimeSlot(); // Track the initial time slot
        function hasTimeSlotChanged() {
            const currentSlot = getCurrentTimeSlot();
            return currentSlot !== initialTimeSlot; // Returns true if slot has changed
        }

        function disableIdleMode() {
            if (idleMode) {
                idleMode = false;
                console.log("Idle mode disabled.");
            }
            startIdleDetection();
        }

        $(document).on('mousemove keydown click scroll', function () {
            disableIdleMode();
        });

        startIdleDetection();

        // Check for spike and start the main routine
        async function checkAndStartRoutine() {
            // if (isCaptchaActive()) { handleCaptchaDetected(); return; }

            const highestSpike = getHighestSpike();
            if (highestSpike) {
                console.log(`Spike detected for ${highestSpike.label} with price ${highestSpike.value}. Starting main routine.`);
                await mainRoutine(highestSpike); // Pass the highest spike to the main routine
            } else {
                console.log("No spike detected. Exiting routine.");
            }
        }

        // Open character menu
        async function openCharacterMenu() {
            const menuButton = document.querySelector('.sideBar .cat .items-shortcut');
            if (menuButton) {
                menuButton.click();
                console.log("Character menu opened.");
                await delay(1200);// Add delay to ensure the menu loads
            }
        }

        // Open car page
        async function openCarPage() {
            const carButton = document.querySelector('.main-controls .buttons-box .icon-cars');
            if (carButton) {
                carButton.click();
                console.log("Car page opened.");
                await delay(1200);// Add delay to ensure the car page loads
            }
        }

        // Sort Booze capacity high
        async function selectAndClickBoozeCapacityMost() {
            // Locate the 'filter-controls' container
            const filterControls = document.querySelector('.filter-controls');

            if (filterControls) {
                // Find the 'sort-order' dropdown within the 'filter-controls'
                const sortOrderDropdown = filterControls.querySelector('.sort-order');

                if (sortOrderDropdown) {
                    // Set the dropdown value to 'booze-most'
                    const optionToSelect = Array.from(sortOrderDropdown.options).find(option => option.value === 'booze-most');
                    if (optionToSelect) {
                        // Select the option
                        sortOrderDropdown.value = 'booze-most';

                        // Simulate a click event
                        optionToSelect.selected = true;
                        sortOrderDropdown.dispatchEvent(new Event('change', { bubbles: true }));

                        console.log("Selected and triggered 'Booze Capacity (Most)' in the filter-controls dropdown.");
                        await delay(1200);// Add delay to ensure the sorting is done
                    } else {
                        console.log("'Booze Capacity (Most)' option not found.");
                    }
                } else {
                    console.log("Sort order dropdown not found in filter-controls.");
                }
            } else {
                console.log("Filter-controls container not found.");
            }
        }

        // Main routine
        async function mainRoutine(highestSpike) {
            await openCharacterMenu();
            await openCarPage();
            await selectAndClickBoozeCapacityMost();
            const firstCarIndex = await getFirstCarWithBooze(); // Get the index of the first car with a mini-bar
            if (firstCarIndex !== -1) {
                await sellBooze(highestSpike, firstCarIndex); // Perform the selling routine
            }
        }

        // Get highest spike
        function getHighestSpike() {
            let highestSpike = null;
            for (let booze of boozeArray) {
                const divText = $('.booze-price.booze-' + booze.id).text().trim();
                const prunedText = divText.replace(/[^0-9]/g, '');
                const boozeValue = parseInt(prunedText, 10);

                // Use the dynamically set threshold for selling
                if (boozeValue > sellingThreshold && (!highestSpike || boozeValue > highestSpike.value)) {
                    highestSpike = { id: booze.id, label: booze.label, value: boozeValue };
                }
            }
            return highestSpike;
        }

        function getFirstCarWithBooze() {
            let firstCarIndex = -1;

            $('.cars-listing .car').each(function (index) {
                const label = $(this).find('.plate-container .BL-progress-bar .label').text().trim();

                // Extract the current and total booze amounts
                const boozeAmounts = label.split('/');
                const currentBooze = parseInt(boozeAmounts[0], 10);

                // Check if the current booze amount is greater than 0
                if (!isNaN(currentBooze) && currentBooze > 0) {
                    firstCarIndex = index;
                    console.log(`First car with booze found at index: ${firstCarIndex}, Booze: ${currentBooze}/${boozeAmounts[1]}`);
                    return false; // Break the loop
                }
            });

            if (firstCarIndex === -1) {
                console.log('No cars with any booze found.');
            }
            return firstCarIndex;
        }

        // Detect city and booze options
        const cityName = $('.city-name').text().trim();
        const boozeArray = cityName === 'Rocky Mount'
            ? [{ id: 1, label: 'Moonshine' }, { id: 2, label: 'Beer' }]
            : [
                { id: 1, label: 'Moonshine' },
                { id: 2, label: 'Beer' },
                { id: 3, label: 'Gin' },
                { id: 4, label: 'Whiskey' },
                { id: 5, label: 'Rum' },
                { id: 6, label: 'Bourbon' }
            ];

        async function sellBooze(highestSpike, firstCarIndex) {
            // Check if Auto Sell is enabled
            if (!autoSellEnabled) {
                console.log("Auto Sell is DISABLED. Skipping selling routine.");
                return;
            }

            console.log("Auto Sell is ENABLED. Proceeding with selling.");

            const totalCarsOnPage = $('.cars-listing .car').length; // Get total cars dynamically on the current page
            console.log(`Total cars on current page: ${totalCarsOnPage}`);

            const carsToCheck = totalCarsOnPage - firstCarIndex;

            // Open the trunk for the first car
            const firstCarDiv = $(`.cars-listing .car:eq(${firstCarIndex})`);
            if (firstCarDiv.length) {
                await executeWithDelay(async () => {
                    firstCarDiv.find('.main-side').trigger('click');
                    console.log(`First car selected: ${firstCarDiv.find('.name').text().trim()} (ID: ${firstCarDiv.data('player-car-id')})`);
                });

                await executeWithDelay(async () => {
                    $('.trunk-button').first().click();
                    console.log("Trunk opened.");
                });

                const boozeNameCar = $('.booze-crates .details .booze-name').text().trim();
                if (highestSpike.label === boozeNameCar) {
                    console.log(`Booze matches: ${highestSpike.label}. Selling...`);

                    await executeWithDelay(async () => {
                        $('.icon-button.car-action-button[data-action="drive"]').trigger('click');
                        console.log("Car is being driven.");
                    });
                    await executeWithDelay(async () => {
                        const sellAllCheckbox = $('input[name="sell_all"]');
                        if (!sellAllCheckbox.is(':checked')) {
                            sellAllCheckbox.prop('checked', true).trigger('change');
                            console.log("'Sell All' checkbox was not selected. Now selected.");
                        } else {
                            console.log("'Sell All' checkbox is already selected.");
                        }
                    });
                    await executeWithDelay(async () => {
                        // Final check for the div before completing the transaction
                        const finalBoozeNameCar = $('.booze-crates .details .name').text().trim();
                        if (highestSpike.label === finalBoozeNameCar) {
                            // Check if time slot has changed
                            if (hasTimeSlotChanged()) {
                                console.log("New time slot detected. Stopping further transactions.");
                                return; // Exit the function without completing the transaction
                            }

                            console.log(`Final check passed. Completing transaction for: ${finalBoozeNameCar}`);
                            await executeWithDelay(async () => {
                                $('input[value="Complete transaction!"]').click();
                                console.log("Transaction complete.");
                            });
                        } else {
                            console.log(`Final check failed. Expected: ${highestSpike.label}, Found: ${finalBoozeNameCar}. Transaction skipped.`);
                        }
                    });
                }
            } else {
                console.log(`First car at index ${firstCarIndex} not found.`);
                return; // Exit if the first car isn't found
            }

            // Navigate through remaining cars using the right arrow
            console.log(`Navigating through ${carsToCheck - 1} remaining cars.`);
            for (let i = 1; i < carsToCheck; i++) {
                await executeWithDelayShort(async () => {
                    $('.BL-wide-arrow.arrow-right.next-car').children('div').click();
                    console.log(`Moved to next car (${i + firstCarIndex}).`);
                });

                const boozeNameCar = $('.booze-crates .details .booze-name').text().trim();
                if (highestSpike.label === boozeNameCar) {
                    console.log(`Booze matches: ${highestSpike.label}. Selling...`);
                    await executeWithDelay(async () => {
                        $('.icon-button.car-action-button[data-action="drive"]').trigger('click');
                        console.log("Car is being driven.");
                    });
                    await executeWithDelay(async () => {
                        const sellAllCheckbox = $('input[name="sell_all"]');
                        if (!sellAllCheckbox.is(':checked')) {
                            sellAllCheckbox.prop('checked', true).trigger('change');
                            console.log("'Sell All' checkbox was not selected. Now selected.");
                        } else {
                            console.log("'Sell All' checkbox is already selected.");
                        }
                    });
                    await executeWithDelay(async () => {
                        // Final check for the div before completing the transaction
                        const finalBoozeNameCar = $('.booze-crates .details .name').text().trim();
                        if (highestSpike.label === finalBoozeNameCar) {
                            // Check if time slot has changed
                            if (hasTimeSlotChanged()) {
                                console.log("New time slot detected. Stopping further transactions.");
                                return; // Exit the function without completing the transaction
                            }

                            console.log(`Final check passed. Completing transaction for: ${finalBoozeNameCar}`);
                            await executeWithDelay(async () => {
                                $('input[value="Complete transaction!"]').click();
                                console.log("Transaction complete.");
                            });
                        } else {
                            console.log(`Final check failed. Expected: ${highestSpike.label}, Found: ${finalBoozeNameCar}. Transaction skipped.`);
                        }
                    });
                }
            }

            await executeWithDelay(async () => {
                $('.trunk-button').first().click();
                console.log("Trunk closed.");
            });
            await executeWithDelay(async () => {
                $('.panel-top .go-back').trigger('click');
            });

            // Check for pagination (Next Button)
            const currentPageText = $('.current-page').text().trim();
            const pageMatch = currentPageText.match(/Page (\d+) of (\d+)/);

            if (pageMatch) {
                const currentPage = parseInt(pageMatch[1]);
                const totalPages = parseInt(pageMatch[2]);

                if (currentPage < totalPages) {
                    console.log(`Finished Page ${currentPage}. Moving to Page ${currentPage + 1}...`);
                    await executeWithDelay(async () => {
                        $('.next-button.page-button').trigger('click');
                    });

                    await delay(1200);// Wait for the page to load completely
                    console.log(`Page ${currentPage + 1} loaded. Refreshing car list...`);

                    const newFirstCarIndex = getFirstCarWithBooze();
                    if (newFirstCarIndex !== -1) {
                        await sellBooze(highestSpike, newFirstCarIndex);
                    } else {
                        console.log("No cars with booze found on the new page.");
                    }
                } else {
                    console.log(`Reached the last page (${currentPage} of $ {totalPages}). Routine complete.`);
                }
            } else {
                console.log("Pagination info not found. Assuming single page.");
            }

            $('.icon-close.main').trigger('click');

            const webhookURLspike = localStorage.getItem('discord.webhook.7'); // Booze Sold webhook
            const discordEnabled = localStorage.getItem('discord.enabled') === 'true';

            if (discordEnabled && webhookURLspike) {
                const data = {
                    content: '',
                    embeds: [
                        {
                            description: `Booze selling for **${username}** finalized in: **${cityName}**`,
                            color: 5763719
                        }
                    ]
                };

                $.ajax({
                    url: webhookURLspike,
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(data),
                    success: function () {
                        console.log('Successfully reported the Sell!');
                    },
                    error: function (xhr, status, error) {
                        console.error('Error on reporting spike:', xhr.status, error);
                    }
                });
            } else {
                console.warn("Discord disabled or webhook.5 missing — skipping Booze Sold webhook.");
            }
        }

        async function executeWithDelay(action) {
            return new Promise((resolve) => {
                setTimeout(async () => {
                    await action(); // Ensure the passed action is awaited
                    resolve();
                }, Math.random() * (1100 - 800) + 800); // Random delay between 1.1s and 1.5s
            });
        }

        async function executeWithDelayShort(action) {
            return new Promise((resolve) => {
                setTimeout(async () => {
                    await action(); // Ensure the passed action is awaited
                    resolve();
                }, Math.random() * (120 - 100) + 100);
            });
        }

        // Helper function: Delay for specific time
        function delay(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }

        // Auto Sell mode toggle logic
        let autoSellEnabled = localStorage.getItem('autoSellEnabled') !== 'false'; // Default is true

        // Default values if none are set
        let sellingThreshold = localStorage.getItem('sellingThreshold') ? parseInt(localStorage.getItem('sellingThreshold'), 10) : 2350;
        let sellingStartMinute = localStorage.getItem('sellingStartMinute') ? parseInt(localStorage.getItem('sellingStartMinute'), 10) : 14;

        function toggleAutoSell() {
            autoSellEnabled = !autoSellEnabled;
            localStorage.setItem('autoSellEnabled', autoSellEnabled);
            console.log(`Auto Sell is now ${autoSellEnabled ? 'ENABLED' : 'DISABLED'}`);
        }

        // Function to update the threshold dynamically
        function updateSellingThreshold(event) {
            let newValue = parseInt($(this).val(), 10) || 2100;
            sellingThreshold = newValue;
            localStorage.setItem('sellingThreshold', newValue);
            console.log(`Updated selling threshold: ${newValue}`);
        }

        // Function to update the start minute dynamically
        function updateSellingStartMinute(event) {
            let newValue = parseInt($(this).val(), 10) || 14;
            sellingStartMinute = newValue;
            localStorage.setItem('sellingStartMinute', newValue);
            console.log(`Updated start minute for selling: ${newValue}`);
        }

        // Append Auto Sell checkbox and settings input fields
        function appendAutoSellCheckbox() {
            const thirdSub3 = $('.sub3').eq(2); // Select the 3rd .sub3 element (0-based index)
            if (thirdSub3.length) {
                const container = $('<div style="text-align: left; margin-bottom: 5px;"></div>');

                // Auto Sell Checkbox
                const autoSellCheckbox = $('<input>', {
                    type: 'checkbox',
                    id: 'autoSellCheckbox',
                    checked: autoSellEnabled
                }).on('change', toggleAutoSell); // Bind event

                const autoSellLabel = $('<label>', {
                    for: 'autoSellCheckbox',
                    text: ' Auto Sell'
                });

                // Input for Selling Threshold
                const thresholdLabel = $('<label>', { text: ' Value selling above ', for: 'sellingThresholdInput' });
                const thresholdInput = $('<input>', {
                    type: 'number',
                    id: 'sellingThresholdInput',
                    value: sellingThreshold,
                    min: 1800,
                    max: 3000,
                    step: 50,
                    style: 'margin-left: 5px; width: 60px;'
                });

                // Input for Start Minute
                const startMinuteLabel = $('<label>', { text: ' Minute in time-slot start selling ', for: 'sellingStartMinuteInput' });
                const startMinuteInput = $('<input>', {
                    type: 'number',
                    id: 'sellingStartMinuteInput',
                    value: sellingStartMinute,
                    min: 0,
                    max: 19,
                    step: 0.25,
                    style: 'margin-left: 5px; width: 40px;'
                });

                // Bind event listeners to inputs (fixes the issue)
                thresholdInput.on('input', updateSellingThreshold);
                startMinuteInput.on('input', updateSellingStartMinute);

                // Append elements to the container
                container.append(autoSellCheckbox).append(autoSellLabel);
                container.append(' | '); // Line break
                container.append(thresholdLabel).append(thresholdInput);
                container.append(' | '); // Line break
                container.append(startMinuteLabel).append(startMinuteInput);

                thirdSub3.append(container);
                console.log('Auto Sell checkbox and configuration inputs appended.');
            }
        }
        appendAutoSellCheckbox(); // Append Auto Sell checkbox

    });
});
