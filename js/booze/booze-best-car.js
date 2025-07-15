document.addEventListener('DOMContentLoaded', async function () {
    $(document).ready(async function () {
        let goDriveUsed = false;
        // grab the best car based on the princpiples of booze-selection-first.js script.
        // best car is either full with right booze, partially filled, or empty. just what comes first.
        // select it by running through the caracter car page just like booze-selection-first.js
        // it should not exceed the safe to travel with: x crates
        // add a button to div3 just like in the topup script. Button label name is "!!"
    
                
        // Utility delay function
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        const executeWithDelay = async (callback) => { await delay(300); await callback(); };
        const executeWithDelayShort = async (callback) => { await delay(40); await callback(); };
        const executeWithDelayLong = async (callback) => { await delay(1500); await callback(); };

        // Sort Booze capacity high
        async function sortBoozeCapacityHigh() {
            const filterControls = document.querySelector('.filter-controls');
            if (filterControls) {
                const sortOrderDropdown = filterControls.querySelector('.sort-order');
                if (sortOrderDropdown) {
                    const optionToSelect = Array.from(sortOrderDropdown.options).find(option => option.value === 'booze-most');
                    if (optionToSelect) {
                        sortOrderDropdown.value = 'booze-most';
                        optionToSelect.selected = true;
                        sortOrderDropdown.dispatchEvent(new Event('change', { bubbles: true }));
                        console.log("Selected and triggered 'Booze Capacity (Most)' in the filter-controls dropdown.");
                        await delay(800);
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

        // Open character menu
        async function openCharacterMenu() {
            const menuButton = document.querySelector('.sideBar .cat .items-shortcut');
            if (menuButton) {
                menuButton.click();
                console.log("Character menu opened.");
                await delay(800);
            } else {
                console.log("Character menu button not found.");
            }
        }

        // Open car page
        async function openCarPage() {
            const carButton = document.querySelector('.main-controls .buttons-box .icon-cars');
            if (carButton) {
                carButton.click();
                console.log("Car page opened.");
                await delay(800);
            } else {
                console.log("Car page button not found.");
            }
        }

        // Check if Back button is visible and click it
        async function ensureCarPageIsOpen() {
            const backButton = document.querySelector('.panel-top .go-back');
            if (backButton) {
                backButton.click();
                console.log("Back button clicked. Returning to car list.");
                await delay(800);
            }
        }

        // Check if car is emptylet goDriveUsed = false;
        function isCarEmpty() {
            const boozeCrates = $('.booze-crates .details .booze-name');
            const cratesDetails = $('.booze-crates .details .crates');
            return boozeCrates.length === 0 || cratesDetails.length === 0;
        }
        
        function selectFirstCar(i)  { const carDiv = $(`.cars-listing .car:eq(${i})`);carDiv.find('.main-side').trigger('click'); }
        function isCarDriving()     { return $('.car-status-icon.status-driving').is(':visible'); }
        function isInTransit()      { return $('.car-status-icon.status-transit').is(':visible'); }
        function goDrive()          { $('.icon-button.car-action-button[data-action="drive"]').trigger('click');goDriveUsed = true;}
        function isTrunkOpen()      { return $('.car-container.show-trunk').length > 0; }
        function toggleTrunk()      { $('.trunk-button').first().click(); }
        function arrowRight()       { $('.BL-wide-arrow.arrow-right.next-car').children('div').click(); }
        function goBack()           { $('.panel-top .go-back').trigger('click'); }
        function finalizeNav()      { toggleTrunk(); goBack(); }
        function fixHot()           { 
            if($('.car-container .is-hot').length > 0) {
                $('.button-group .car-action-button[data-action="plates"]').trigger('click');
                $('.dialog .buttons .do-button[value="Do it!"]').trigger('click');
            } else {
                return
            } 
        }
        
        // Reset pagination to the first page
        async function resetToFirstPage() {
            let currentPage = null;
            let attempts = 0; // Prevent infinite loops

            while (true) {
                const currentPageText = $('.current-page').text().trim();
                const pageMatch = currentPageText.match(/Page (\d+) of (\d+)/);
                if (pageMatch) {
                    currentPage = parseInt(pageMatch[1]);
                    const totalPages = parseInt(pageMatch[2]);

                    if (currentPage > 1) {
                        console.log(`Currently on Page ${currentPage} of ${totalPages}. Navigating back to Page ${currentPage - 1}...`);
                        await executeWithDelay(async () => {
                            $('.prev-button.page-button').trigger('click');
                        });
                        await delay(800); // Wait for the page to load completely
                    } else {
                        console.log("Successfully reset to Page 1.");
                        return; // Exit once on the first page
                    }
                } else {
                    console.log("Unable to determine current page. Pagination may not be available.");
                    return;
                }

                // Prevent infinite loops by limiting attempts
                attempts++;
                if (attempts > 10) {
                    console.log("Too many attempts to reset pagination. Aborting.");
                    return;
                }
            }
        }

        // Navigate to the next page
        async function navigateToNextPage() {
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
                    await delay(800); // Wait for the page to load completely
                    console.log(`Page ${currentPage + 1} loaded. Refreshing car list...`);
                    return true; // Indicates navigation was successful
                }
            }
            console.log("No more pages to navigate. Routine complete.");
            return false; // Indicates no further pages
        }

        // Get booze value
        function getBoozeValue(boozeId) {
            const divText = $(`.booze-price.booze-${boozeId}`).text().trim();
            const prunedText = divText.replace(/[^0-9]/g, '');
            return parseInt(prunedText, 10) || 0;
        }

        // Detect city and booze options
        function getBoozeOptions() {
            const cityName = $('.city-name').text().trim();
            return cityName === 'Rocky Mount'
                ? [{ id: 1, label: 'Moonshine' }, { id: 2, label: 'Beer' }]
                : [
                    { id: 1, label: 'Moonshine' },
                    { id: 2, label: 'Beer' },
                    { id: 3, label: 'Gin' },
                    { id: 4, label: 'Whiskey' },
                    { id: 5, label: 'Rum' },
                    { id: 6, label: 'Bourbon' }
                ];
        }

        // Find valid booze types with value < 150, prioritize the one with the highest stock if multiple exist
        function getLowValueBooze() {
            const cityName = $('.city-name').text().trim();
            const boozeOptions = getBoozeOptions();
            const lowValueBooze = boozeOptions.filter(booze => {
                // Exclude Beer if the current city is New York City
                if (cityName === "New York City" && booze.label === "Beer") {
                    console.log(`Skipping Beer as current city is ${cityName}`);
                    return false;
                }
                if (cityName === "New Orleans" && booze.label === "Bourbon") {
                    console.log(`Skipping Bourbon as current city is ${cityName}`);
                    return false;
                }
                return getBoozeValue(booze.id) < 150;
            });

            console.log("Booze types under 150:", lowValueBooze.map(b => b.label));

            if (lowValueBooze.length === 0) {
                console.log("No booze found with value < 150.");
                return [];
            }

            let highestStockBooze = null;

            lowValueBooze.forEach(booze => {
                const boozeCell = document.querySelector(`.booze-cell[data-booze-id="${booze.id}"]`);
                const labelDiv = boozeCell.querySelector('.BL-progress-bar .label');

                if (labelDiv) {
                    const [currentStock] = labelDiv.textContent
                        .trim()
                        .split('/')
                        .map(num => parseInt(num.replace(/[^0-9]/g, ''), 10) || 0);

                    // Update highest stock booze if necessary
                    if (!highestStockBooze || currentStock > highestStockBooze.currentStock) {
                        highestStockBooze = {
                            ...booze,
                            currentStock: currentStock,
                        };
                    }
                }
            });

            if (highestStockBooze) {
                console.log(
                    `Selected booze with the highest stock under 150 value: ${highestStockBooze.label} (${highestStockBooze.currentStock})`
                );
                return [highestStockBooze];
            }

            console.log("No valid production data found for booze types under 150.");
            return [];
        }

        // Extract the "Safe to travel with" value from the HTML
        function getSafeToTravelWith() {
            const safeToTravelElement = $('.info-display .title:contains("Safe to travel with:")')
                .next('.description')
                .find('.attribute-gym-color');
            if (safeToTravelElement.length) {
                const safeToTravelText = safeToTravelElement.text().trim();
                const safeToTravel = parseInt(safeToTravelText.replace(/[^0-9]/g, ''), 10);
                console.log(`Safe to travel with: ${safeToTravel} crates`);
                return safeToTravel;
            } else {
                console.warn('Safe to travel with value not found.');
                return 0;
            }
        }

        async function driveBestCar(firstCarIndex = 0) {
            const lowValueBooze = getLowValueBooze();
            const boozeLabels = lowValueBooze.map(booze => booze.label);
        
            // Dynamically retrieve the safe crates limit
            const safeCratesLimit = getSafeToTravelWith();
            if (safeCratesLimit === 0) {
                console.warn("Safe crates limit could not be determined. Aborting.");
                return;
            }
        
            const totalCarsOnPage = $('.cars-listing .car').length;
            console.log(`Total cars on current page: ${totalCarsOnPage}`);
        
            for (let i = firstCarIndex; i < totalCarsOnPage; i++) {
                const carDiv = $(`.cars-listing .car:eq(${i})`);
                if (carDiv.length) {
                    // Select the car
                    selectFirstCar(i);
        
                    // Open the trunk if not already open
                    if (!isTrunkOpen()) {
                        await executeWithDelay(async () => {
                            toggleTrunk();
                            console.log(`Trunk opened for car ${i + 1}`);
                        });
                    }
        
                    const boozeName = $('.booze-crates .details .booze-name').text().trim();
                    const cratesText = $('.booze-capacity-box .BL-progress-bar .label').text().trim();
                    const [currentCrates, maxCrates] = cratesText.split('/').map(num => parseInt(num.replace(/[^0-9]/g, ''), 10) || 0);
        
                    const isFull = currentCrates === maxCrates && currentCrates > 0;
                    const isPartiallyFilled = currentCrates > 0 && currentCrates < maxCrates;
                    const isWithinSafeLimit = currentCrates <= safeCratesLimit || currentCrates === 3256;
        
                    // Determine the best car based on the priority
                    if (boozeLabels.includes(boozeName)) {
                        if (isFull && isWithinSafeLimit && !isInTransit()) {
                            console.log(`Full car found with safe crates: ${boozeName} (${currentCrates}/${maxCrates}). Driving.`);
                            if (!isCarDriving()) {
                                await executeWithDelayLong(async () => {
                                    fixHot();
                                });
                                await executeWithDelayLong(async () => {
                                    goDrive();
                                    console.log("Car is now being driven.");
                                });
                            } else {
                                goDriveUsed = true;
                            }
                            finalizeNav();
                            return; // Best car found, stop further checks
                        } else if (isPartiallyFilled && isWithinSafeLimit && !isInTransit()) {
                            console.log(`Partially filled car found: ${boozeName} (${currentCrates}/${maxCrates}). Attempting to drive.`);
                            if (!isCarDriving()) {
                                await executeWithDelayLong(async () => {
                                    fixHot();
                                });
                                await executeWithDelayLong(async () => {
                                    goDrive();
                                    console.log("Car is now being driven.");
                                });
                            } else {
                                goDriveUsed = true;
                            }
                            finalizeNav();
                            return; // Best available car found, stop further checks
                        }
                    }
                    
                    // Move to the next car
                    await executeWithDelayShort(async () => {
                        arrowRight();
                        console.log(`Moved to the next car (${i + 1}).`);
                    });
                }
            }

            // Handle pagination if no suitable car is found on the current page
            await executeWithDelay(async () => {
                goBack();
            });
        
            if (await navigateToNextPage()) {
                await driveBestCar(0); // Restart check on the new page
            }

            // Step 2: Reset pagination to the first page
            await resetToFirstPage();

            // Step 3: Navigate cars to find an empty car only if goDrive was not used
            if (!goDriveUsed) {
                console.log("Navigating cars to find the best car...");
                await driveEmptyCar();
            } else {
                console.log("goDrive was used. Skipping driveEmptyCar.");
            }
        }

        async function driveEmptyCar(firstCarIndex = 0) {
            const lowValueBooze = getLowValueBooze();
            const boozeLabels = lowValueBooze.map(booze => booze.label);
        
            // Dynamically retrieve the safe crates limit
            const safeCratesLimit = getSafeToTravelWith();
            if (safeCratesLimit === 0) {
                console.warn("Safe crates limit could not be determined. Aborting.");
                return;
            }
        
            const totalCarsOnPage = $('.cars-listing .car').length;
            console.log(`Total cars on current page: ${totalCarsOnPage}`);
        
            for (let i = firstCarIndex; i < totalCarsOnPage; i++) {
                const carDiv = $(`.cars-listing .car:eq(${i})`);
                if (carDiv.length) {
                    // Select the car
                    selectFirstCar(i);
        
                    // Open the trunk if not already open
                    if (!isTrunkOpen()) {
                        await executeWithDelay(async () => {
                            toggleTrunk();
                            console.log(`Trunk opened for car ${i + 1}`);
                        });
                    }
        
                    // Check for an empty car as a last resort
                    if (isCarEmpty() && !isInTransit()) {
                        console.log(`Empty car found: ${carDiv.find('.name').text().trim()} (ID: ${carDiv.data('player-car-id')}). Driving.`);
                        if (!isCarDriving()) {
                            await executeWithDelayLong(async () => {
                                fixHot();
                            });
                            await executeWithDelayLong(async () => {
                                goDrive();
                                console.log("Car is now being driven.");
                            });
                        } else {
                            goDriveUsed = true;
                        }
                        finalizeNav();
                        return; // Stop further checks
                    }
        
                    // Move to the next car
                    await executeWithDelayShort(async () => {
                        arrowRight();
                        console.log(`Moved to the next car (${i + 1}).`);
                    });
                }
            }

            // Handle pagination if no suitable car is found on the current page
            await executeWithDelay(async () => {
                goBack();
            });
        
            if (await navigateToNextPage()) {
                await driveEmptyCar(0); // Restart check on the new page
            }
        }
        
        $('.get-first-best').click(async function () {
            console.log("Starting 'Get First Best Car' routine...");
            
            // Step 1: Open character menu and car page
            await openCharacterMenu();
            await openCarPage();
            await ensureCarPageIsOpen();
            await sortBoozeCapacityHigh();
            
            // Step 2: Reset pagination to the first page
            await resetToFirstPage();
            
            // Step 3: Navigate cars to find an empty car
            console.log("Navigating cars to find the best car...");
            await driveBestCar();
            
            await delay(4000);
            // Step 4: Close the character menu
            $('.icon-close.main').trigger('click');
            console.log("Routine completed. Character menu closed.");
        });

    });
});
