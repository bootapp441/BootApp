document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {

        //----------------------------------------------------------------------------
        // 0) Helper to close the character menu
        //----------------------------------------------------------------------------
        function closeCharacterMenu() {
            const closeBtn = document.querySelector('.icon-close.main');
            if (closeBtn) {
                closeBtn.click();
                console.log('Closed character menu overlay.');
            } else {
                console.log('No close button found (maybe menu not open).');
            }
        }

        //----------------------------------------------------------------------------
        // 1) Build our UI: "Consume Lemonade" checkbox, "Auto Stop Lemo Mode" checkbox,
        //    and the boundary-minutes input
        //----------------------------------------------------------------------------

        // Identify where in the DOM to place these controls
        const thirdSub3 = $('.sub3').eq(2); // Example: 3rd .sub3 element
        const container = $('<div style="text-align: left; margin-bottom: 5px;"></div>');

        // [A] Lemonade Mode Checkbox
        const lemoCheckbox = document.createElement('input');
        lemoCheckbox.type = 'checkbox';
        lemoCheckbox.id = 'lemoCheckbox';
        lemoCheckbox.checked = (localStorage.getItem('lemoMode') === 'true');

        const lemoLabel = document.createElement('label');
        lemoLabel.setAttribute('for', 'lemoCheckbox');
        lemoLabel.textContent = ' Consume Lemonade | Auto stop Lemo mode if none left ';

        container.append(lemoCheckbox);
        container.append(lemoLabel);

        // [B] Auto Stop Lemo Mode Checkbox
        const autoStopLemoStored = localStorage.getItem('autoStopLemo');
        // Default true if not set yet
        const autoStopDefault = (autoStopLemoStored === null) ? true : (autoStopLemoStored === 'true');
        
        const autoStopLemoCheckbox = document.createElement('input');
        autoStopLemoCheckbox.type = 'checkbox';
        autoStopLemoCheckbox.id = 'autoStopLemoCheckbox';
        autoStopLemoCheckbox.checked = autoStopDefault;

        const autoStopLemoLabel = document.createElement('label');
        autoStopLemoLabel.setAttribute('for', 'autoStopLemoCheckbox');
        autoStopLemoLabel.textContent = ' | ';

        container.append(autoStopLemoCheckbox);
        container.append(autoStopLemoLabel);

        // If 'autoStopLemo' doesn't exist, store the default (true) right now
        if (autoStopLemoStored === null) {
            localStorage.setItem('autoStopLemo', autoStopDefault);
        }

        // [C] Boundary Minutes Input (default = 26.5 if none stored)
        const boundaryLabel = document.createElement('label');
        boundaryLabel.textContent = ' Keep ';

        const storedBoundaryVal = parseFloat(localStorage.getItem('boundaryMinutes')) || 26.5;
        const boundaryInput = document.createElement('input');
        boundaryInput.type = 'number';
        boundaryInput.step = '0.5';           // step in half-min increments
        boundaryInput.min = '0';             // no negative
        boundaryInput.style.width = '60px';  // narrower input
        boundaryInput.value = storedBoundaryVal.toString();

        const boundaryAfter = document.createElement('label');
        boundaryAfter.textContent = ' minutes Drive Timer';

        container.append(boundaryLabel);
        container.append(boundaryInput);
        container.append(boundaryAfter);

        thirdSub3.append(container);
        console.log('Lemo checkbox, Auto-Stop checkbox, and boundary input appended.');

        //----------------------------------------------------------------------------
        // 2) Update localStorage on user interaction
        //----------------------------------------------------------------------------

        // Checkbox: toggles "lemoMode"
        lemoCheckbox.addEventListener('change', function() {
            localStorage.setItem('lemoMode', this.checked);
            console.log('Lemonade consumption mode (lemoMode) is now:', this.checked);
        });

        // Checkbox: toggles "autoStopLemo"
        autoStopLemoCheckbox.addEventListener('change', function() {
            localStorage.setItem('autoStopLemo', this.checked);
            console.log('Auto Stop Lemo mode is now:', this.checked);
        });

        // Input: updates boundaryMinutes in localStorage
        boundaryInput.addEventListener('change', function() {
            const val = parseFloat(boundaryInput.value);
            if (!isNaN(val)) {
                localStorage.setItem('boundaryMinutes', val);
                console.log('Updated boundaryMinutes to:', val);
            }
        });

        //----------------------------------------------------------------------------
        // 3) Helper: Return a random delay in ms between min and max *seconds*
        //----------------------------------------------------------------------------

        function getRandomDelay(minSeconds, maxSeconds) {
            return Math.floor(Math.random() * (maxSeconds - minSeconds + 1) + minSeconds) * 1000;
        }

        //----------------------------------------------------------------------------
        // 4) Function to parse drive timer from the page
        //    (e.g. #timer-dri > .BL-timer-display => "HH:MM:SS" or "MM:SS")
        //----------------------------------------------------------------------------

        function getDriveTimerSeconds() {
            const timerElem = document.querySelector('#timer-dri .BL-timer-display');
            if (!timerElem) {
                console.log('Drive timer element not found. Defaulting to 0 seconds.');
                return 0;
            }

            const timeString = timerElem.textContent.trim(); // e.g. "00:25:52"
            const parts = timeString.split(':').map(Number);

            let totalSeconds = 0;
            if (parts.length === 3) {
                // HH:MM:SS
                totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
            } else if (parts.length === 2) {
                // MM:SS
                totalSeconds = parts[0] * 60 + parts[1];
            }

            return totalSeconds;
        }

        //----------------------------------------------------------------------------
        // 5) Main function: decide if/ how many Lemonades to consume
        //----------------------------------------------------------------------------

        async function consumeLemonade() {
            // Existing supplyMode
            const supplyMode = localStorage.getItem('supplyMode') === 'true'; 
            // New lemoMode
            const lemoMode = localStorage.getItem('lemoMode') === 'true';

            // Proceed only if both supplyMode and lemoMode are true
            if (!supplyMode || !lemoMode) {
                console.log('Either supplyMode is OFF or lemoMode is OFF; skipping Lemonade consumption.');
                return;
            }

            // Get the current drive timer in seconds
            const driveTimerSeconds = getDriveTimerSeconds();
            console.log('Current drive timer in seconds:', driveTimerSeconds);

            // Each Lemonade subtracts 900s (15m)
            // Use the user-defined boundary (in minutes) from localStorage
            const boundaryMinutes = parseFloat(localStorage.getItem('boundaryMinutes')) || 14;
            const boundarySeconds = boundaryMinutes * 60;

            // Calculate how many Lemonades we can consume
            let maxLemo = Math.floor((driveTimerSeconds - boundarySeconds) / 900);
            if (maxLemo < 0) {
                maxLemo = 0;
            }

            if (maxLemo === 0) {
                console.log(`No Lemonade consumption possible without going below ${boundaryMinutes} minutes.`);
                return;
            }

            //--------------------------------------------------------------------------
            // Open the Character Menu to ensure items are accessible
            //--------------------------------------------------------------------------
            const menuButton = document.querySelector('.sideBar .cat .items-shortcut');
            if (menuButton) {
                menuButton.click();
                console.log('Character menu opened.');
            }

            // Wait a moment for the character page to load
            setTimeout(async () => {
                try {
                    //--------------------------------------------------------------------------
                    // Find all Lemonade items
                    //--------------------------------------------------------------------------
                    const lemonadeElements = document.querySelectorAll('.item.usable .BL-item.no-info[data-id="100"]');
                    if (!lemonadeElements || lemonadeElements.length === 0) {
                        console.log('No Lemonade found in inventory.');
                        
                        // Auto-stop logic if none are present at all
                        const autoStopLemo = (localStorage.getItem('autoStopLemo') === 'true');
                        if (autoStopLemo) {
                            console.log('Auto Stop Lemo Mode is ON; turning off lemoMode...');
                            localStorage.setItem('lemoMode', false);
                            lemoCheckbox.checked = false;
                        }
                        return;
                    }

                    // Sort by data-player-item-id ascending
                    const sortedLemonadeItems = [...lemonadeElements].sort((a, b) => {
                        const idA = Number(a.getAttribute('data-player-item-id'));
                        const idB = Number(b.getAttribute('data-player-item-id'));
                        return idA - idB;
                    });

                    // Determine how many we have
                    const totalAvailable = sortedLemonadeItems.length;
                    const toConsume = Math.min(totalAvailable, maxLemo);

                    console.log(`Allowed up to ${maxLemo} lemonades; have ${totalAvailable}. Consuming ${toConsume}.`);

                    // If toConsume is zero, we effectively have no use for the lemonades right now
                    if (toConsume === 0) {
                        console.log('We have some lemonade, but not consuming any now. Stopping here.');
                        return;
                    }

                    // Prepare the item IDs to consume
                    const itemIdsToUse = sortedLemonadeItems
                        .slice(0, toConsume)
                        .map(el => el.getAttribute('data-player-item-id'));

                    // Actually consume them
                    await processItems(itemIdsToUse, totalAvailable);

                } finally {
                    // Always try to close the menu afterwards
                    closeCharacterMenu();
                }

            }, 3000); // e.g., wait 3s
        }

        //----------------------------------------------------------------------------
        // 6) processItems: consumes each Lemonade in sequence (3-5s between)
        //----------------------------------------------------------------------------

        async function processItems(itemIds, totalAvailable) {
            console.log(`Starting to consume ${itemIds.length} Lemonade(s).`);

            for (let i = 0; i < itemIds.length; i++) {
                const itemId = itemIds[i];

                console.log(`Consuming Lemonade ${i + 1}/${itemIds.length} (item_id: ${itemId})`);
                
                try {
                    const response = await fetch("https://www.bootleggers.us/ajax/player.php?action=use-item", {
                        method: "POST",
                        headers: {
                            "Accept": "*/*",
                            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                            "Referer": document.location.href,
                            "X-Requested-With": "XMLHttpRequest"
                        },
                        body: new URLSearchParams({ "item_id": itemId })
                    });

                    const data = await response.json();
                    console.log(`Response for item_id ${itemId}:`, data);

                } catch (error) {
                    console.error(`Error consuming item_id ${itemId}:`, error);
                }

                // Wait 3-5 seconds before the next Lemonade
                const delaySeconds = Math.random() * (5 - 3) + 3; // 3 to 5
                console.log(`Waiting ${delaySeconds.toFixed(2)}s before next Lemonade...`);
                await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
            }

            console.log('All targeted Lemonades have been consumed.');

            // After consuming, check if that was the last we had
            // If totalAvailable == itemIds.length, we consumed them all
            const autoStopLemo = (localStorage.getItem('autoStopLemo') === 'true');
            if (autoStopLemo && totalAvailable === itemIds.length) {
                console.log('We consumed the LAST lemonade(s). Auto Stop Lemo Mode is ON; turning off lemoMode...');
                localStorage.setItem('lemoMode', false);
                const lemoCheckbox = document.getElementById('lemoCheckbox');
                if (lemoCheckbox) {
                    lemoCheckbox.checked = false;
                }
            }
        }

        //----------------------------------------------------------------------------
        // 7) Schedule the consumption check after page load
        //----------------------------------------------------------------------------

        // Kick it off after, e.g., 3-6s random delay
        setTimeout(consumeLemonade, getRandomDelay(3, 6)); 

    });
});