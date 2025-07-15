document.addEventListener('DOMContentLoaded', async function () {
    $(document).ready(async function () {

        // Utility delay function
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        const executeWithDelay = async (callback) => { await delay(200); await callback(); };
        const executeWithDelayShort = async (callback) => { await delay(70); await callback(); };

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
                        await delay(400);
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
                await delay(400);
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
                await delay(400);
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
                await delay(400);
            }
        }

        // Check if car is empty
        function isCarEmpty() {
            const boozeCrates = $('.booze-crates .details .booze-name');
            const cratesDetails = $('.booze-crates .details .crates');
            return boozeCrates.length === 0 || cratesDetails.length === 0;
        }
        
        function selectFirstCar(i)  { const carDiv = $(`.cars-listing .car:eq(${i})`);carDiv.find('.main-side').trigger('click'); }
        function isCarDriving()     { return $('.car-status-icon.status-driving').is(':visible'); }
        function isInTransit()      { return $('.car-status-icon.status-transit').is(':visible'); }
        function goDrive()          { $('.icon-button.car-action-button[data-action="drive"]').trigger('click'); }
        function isTrunkOpen()      { return $('.car-container.show-trunk').length > 0; }
        function toggleTrunk()      { $('.trunk-button').first().click(); }
        function arrowRight()       { $('.BL-wide-arrow.arrow-right.next-car').children('div').click(); }
        function goBack()           { $('.panel-top .go-back').trigger('click'); }

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
                        await delay(400); // Wait for the page to load completely
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
                    await delay(400); // Wait for the page to load completely
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

        // Find valid booze types with value < 150
        function getLowValueBooze() {
            const boozeOptions = getBoozeOptions();
            const lowValueBooze = boozeOptions.filter(booze => getBoozeValue(booze.id) < 150);
            console.log("Booze types under 150:", lowValueBooze.map(b => b.label));
            return lowValueBooze;
        }

        // Check car trunk for matching booze and capacity conditions
        function isCarMatchingBoozeAndCapacity(boozeLabels) {
            const boozeName = $('.booze-crates .details .booze-name').text().trim();
            const cratesText = $('.booze-capacity-box .BL-progress-bar .label').text().trim();
            const [currentCrates, maxCrates] = cratesText.split('/').map(num => parseInt(num.replace(/[^0-9]/g, ''), 10) || 0);

            const isFull = currentCrates > 0 && currentCrates === maxCrates; // Check if car is full (e.g., 100/100)
            const aboveThreshold = currentCrates >= 3240; // Check if crates are above 3240

            return boozeLabels.includes(boozeName) && (isFull || aboveThreshold);
        }

        async function driveFirstEmptyCar(firstCarIndex = 0) {
            const totalCarsOnPage = $('.cars-listing .car').length;
            console.log(`Total cars on current page: ${totalCarsOnPage}`);
        
            for (let i = firstCarIndex; i < totalCarsOnPage; i++) {
                const carDiv = $(`.cars-listing .car:eq(${i})`);
                if (carDiv.length) {
                    selectFirstCar(i);
                    const cratesText = $('.booze-capacity-box .BL-progress-bar .label').text().trim();
                    const [currentCrates, maxCrates] = cratesText.split('/').map(num => parseInt(num.replace(/[^0-9]/g, ''), 10) || 0);
        
                    if (currentCrates === 0 && maxCrates === 1750 && !isInTransit()) {
                        console.log(`Empty car found: ${carDiv.find('.name').text().trim()} (ID: ${carDiv.data('player-car-id')})`);
                        if (!isCarDriving()) {
                            console.log("Car is not driving. Clicking 'Drive' button.");
                            await executeWithDelay(async () => {
                                goDrive();
                                console.log("Car is now being driven.");
                            });
                        } else {
                            console.log("Car is already driving. Skipping.");
                        }
                        return; // Stop further processing as an empty car has been found
                    }
        
                    // Move to the next car
                    await executeWithDelayShort(async () => {
                        arrowRight();
                        console.log(`Moved to the next car (${i + 1}).`);
                    });
                }
            }
        
            // Handle pagination if no empty car is found on the current page
            await executeWithDelay(async () => {
                goBack();
            });
        
            if (await navigateToNextPage()) {
                await driveFirstEmptyCar(0); // Restart check on the new page
            }
        }

        // Navigate cars and drive the first full car
        async function driveFirstFullCar() {
            const lowValueBooze = getLowValueBooze();
            const boozeLabels = lowValueBooze.map(booze => booze.label);

            const totalCarsOnPage = $('.cars-listing .car').length;
            console.log(`Total cars on current page: ${totalCarsOnPage}`);

            for (let i = 0; i < totalCarsOnPage; i++) {
                const carDiv = $(`.cars-listing .car:eq(${i})`);
                if (carDiv.length) {

                    selectFirstCar(i);

                    if (!isTrunkOpen()) {
                        await executeWithDelay(async () => {
                            toggleTrunk();
                        });
                    }
                    const cratesText = $('.booze-capacity-box .BL-progress-bar .label').text().trim();
                    const [currentCrates, maxCrates] = cratesText.split('/').map(num => parseInt(num.replace(/[^0-9]/g, ''), 10) || 0);
        
                    if (isCarMatchingBoozeAndCapacity(boozeLabels) && maxCrates === 1750 && !isInTransit()) {
                        if (!isCarDriving()) {
                            await executeWithDelay(async () => {
                                goDrive();
                            });
                        }
                        return;
                    }
                    
                    await executeWithDelayShort(async () => {
                        arrowRight();
                    });
                }
            }

            // Handle pagination
            await executeWithDelay(async () => {
                goBack();
            });

            if (await navigateToNextPage()) {
                await driveFirstFullCar(); 
            }
        }

        async function driveToTopUpCar(firstCarIndex = 0) {
            const lowValueBooze = getLowValueBooze();
            const boozeLabels = lowValueBooze.map(booze => booze.label);
        
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
        
                    // Check if the car matches the "top-up" condition
                    const boozeName = $('.booze-crates .details .booze-name').text().trim();
                    const cratesText = $('.booze-capacity-box .BL-progress-bar .label').text().trim();
                    const [currentCrates, maxCrates] = cratesText.split('/').map(num => parseInt(num.replace(/[^0-9]/g, ''), 10) || 0);
        
                    const isPartiallyFilled = currentCrates > 0 && currentCrates < maxCrates;
                    if (boozeLabels.includes(boozeName) && isPartiallyFilled && maxCrates === 1750 && !isInTransit()) {
                        console.log(`Partially filled car found: ${boozeName} (${currentCrates}/${maxCrates}). Attempting to drive.`);
                        if (!isCarDriving()) {
                            await executeWithDelay(async () => {
                                goDrive();
                                console.log("Car is now being driven to top up.");
                            });
                        } else {
                            console.log("Car is already driving. Skipping.");
                        }
                        return; // Stop further processing
                    }
        
                    // Move to the next car
                    await executeWithDelayShort(async () => {
                        arrowRight();
                        console.log(`Moved to the next car (${i + 1}).`);
                    });
                }
            }
        
            // Handle pagination if no matching car is found on the current page
            await executeWithDelay(async () => {
                goBack();
            });
        
            if (await navigateToNextPage()) {
                await driveToTopUpCar(0); // Restart check on the new page
            }
        }        

        // Add buttons to the interface
        var selectionOptions = `
            <div style="display: flex; gap: 20px; justify-content: center; align-items: center; font-family: 'Courier New', Courier, monospace;">        
                <span style="font-size: 9pt; background-color: rgba(161, 45, 19, 0.58); color: white; font-weight: bold; padding: 0px 3px; margin-top: 1px; margin-bottom: 1px; border: 1px solid white; border-radius: 3px; cursor: pointer;" 
                    class="get-first-empty-1750">
                    ▢ 1750 ▢▢▢▢▢
                </span>
                <span style="font-size: 9pt; background-color: rgba(161, 45, 19, 0.58); color: white; font-weight: bold; padding: 0px 3px; margin-top: 1px; margin-bottom: 1px; border: 1px solid white; border-radius: 3px; cursor: pointer;" 
                class="get-first-topup-1750">
                    ▣ 1750 ▣▣▣▢▢
                </span>
                <span style="font-size: 9pt; background-color: rgba(161, 45, 19, 0.58); color: white; font-weight: bold; padding: 0px 3px; margin-top: 1px; margin-bottom: 1px; border: 1px solid white; border-radius: 3px; cursor: pointer;" 
                    class="get-first-full-1750">
                    ▣ 1750 ▣▣▣▣▣
                </span>
            </div>
        `;
        $('.sub3').first().append(selectionOptions);

        $('.get-first-empty-1750').click(async function () {
            console.log("Starting 'Get First Empty Car' routine...");
            
            // Step 1: Open character menu and car page
            await openCharacterMenu();
            await openCarPage();
            await ensureCarPageIsOpen();
            await sortBoozeCapacityHigh();
            
            // Step 2: Reset pagination to the first page
            await resetToFirstPage();
            
            // Step 3: Navigate cars to find an empty car
            console.log("Navigating cars to find an empty car...");
            await driveFirstEmptyCar();
            
            // Step 4: Close the character menu
            $('.icon-close.main').trigger('click');
            console.log("Routine completed. Character menu closed.");
        });

        $('.get-first-full-1750').click(async function () {
            console.log("Starting 'Get First Full Car' routine...");
            
            // Step 1: Identify booze types with values under 150
            const lowValueBooze = getLowValueBooze();
            if (lowValueBooze.length === 0) {
                console.log("No booze types with values under 150 found. Routine aborted.");
                return;
            }
            
            // Step 2: Open character menu and car page
            await openCharacterMenu();
            await openCarPage();
            await ensureCarPageIsOpen();
            await sortBoozeCapacityHigh();
            
            // Step 3: Reset pagination to the first page
            await resetToFirstPage();
            
            // Step 4: Check cars for matching booze types
            console.log("Navigating cars to find a matching full car...");
            await driveFirstFullCar();
            
            // Step 5: Close the character menu
            $('.icon-close.main').trigger('click');
            console.log("Routine completed. Character menu closed.");
        });

        $('.get-first-topup-1750').click(async function () {
            console.log("Starting 'Get First to Top Up Car' routine...");
            
            // Step 1: Identify booze types with values under 150
            const lowValueBooze = getLowValueBooze();
            
            // Step 2: Open character menu and car page
            await openCharacterMenu();
            await openCarPage();
            await ensureCarPageIsOpen();
            await sortBoozeCapacityHigh();
            
            // Step 3: Reset pagination to the first page
            await resetToFirstPage();
            
            // Step 4: Navigate cars to find a partially filled car
            console.log("Navigating cars to find a partially filled car...");
            await driveToTopUpCar();
            
            // Step 5: Close the character menu
            $('.icon-close.main').trigger('click');
            console.log("Routine completed. Character menu closed.");
        });
    });
});
