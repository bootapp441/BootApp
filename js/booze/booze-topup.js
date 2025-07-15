document.addEventListener('DOMContentLoaded', async function () {
    $(document).ready(function () {
        // Utility delay function
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
                
        // Get the booze value
        function getBoozeValue(boozeId) {
            const divText = $(`.booze-price.booze-${boozeId}`).text().trim();
            const prunedText = divText.replace(/[^0-9]/g, '');
            return parseInt(prunedText, 10) || 0;
        }

        // Get the available booze from the progress bar
        function getAvailableBooze(boozeId) {
            const progressBar = $(`.booze-cell[data-booze-id='${boozeId}'] .BL-progress-bar .label`);
            if (progressBar.length > 0) {
                const label = progressBar.text().trim();
                const [current, max] = label.split('/').map(num => parseInt(num.replace(/[^0-9]/g, ''), 10) || 0);
                return { current, max };
            } else {
                console.log(`Unable to locate progress bar for booze ID: ${boozeId}`);
                return { current: 0, max: 0 };
            }
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

        // Add "Top Up" buttons
        function addTopUpButtons() {
            $('.booze-cell').each(function () {
                const boozeId = $(this).data('booze-id');
                const boozeValue = getBoozeValue(boozeId);

                if (boozeValue < 150) {
                    const buttonHtml = `<span class="top-up-button" data-booze-id="${boozeId}" style="font-size: 10pt; background-color: rgba(161, 45, 19, 0.58); color: white; font-weight: bold; padding: 0px 5px; border: 1px solid white; border-radius: 10px; cursor: pointer; display: inline-block; text-align: center; margin-bottom: 5px;"> ++ </span>`;
                    $(this).append(buttonHtml);
                }
            });
        }

        async function topUpCar(boozeId) {
            const boozeAvailable = getAvailableBooze(boozeId);
            const carCapacity = getCarBoozeCapacity();
            const safeToTravelWith = getSafeToTravelWith(); // Get the safe-to-travel value dynamically
        
            // Calculate available space in the car
            const availableCarSpace = carCapacity.max - carCapacity.current;
        
            // Special condition for first fill to "safe to travel with" value
            if (carCapacity.current < safeToTravelWith) {
                const fillAmount = Math.min(
                    safeToTravelWith - carCapacity.current,
                    boozeAvailable.current,
                    availableCarSpace
                );
        
                if (fillAmount > 0) {
                    $(`input[name='purch[${boozeId}]']`).val(fillAmount);
                    console.log(
                        `Filling car to safe-to-travel value (${safeToTravelWith}) with ${fillAmount} crates of booze ID: ${boozeId}.`
                    );
        
                    // Trigger transaction
                    await delay(200);
                    $('input[value="Complete transaction!"]').trigger('click');
                    console.log("Transaction completed.");
                } else {
                    console.log(
                        `Unable to fill to safe-to-travel value (${safeToTravelWith}). Car space: ${carCapacity.current}/${carCapacity.max}, Booze available: ${boozeAvailable.current}/${boozeAvailable.max}.`
                    );
                }
                return; // Exit early since first fill condition was handled
            }
        
            // Special condition for second fill to 3256
            const targetSecondFill = 3256;
            if (
                (carCapacity.max === 5000 || carCapacity.max === 8125) &&
                carCapacity.current < targetSecondFill
            ) {
                const fillAmount = Math.min(
                    targetSecondFill - carCapacity.current,
                    boozeAvailable.current
                );
        
                if (fillAmount > 0) {
                    $(`input[name='purch[${boozeId}]']`).val(fillAmount);
                    console.log(
                        `Filling car to ${targetSecondFill} with ${fillAmount} crates of booze ID: ${boozeId}.`
                    );
        
                    // Trigger transaction
                    await delay(200);
                    $('input[value="Complete transaction!"]').trigger('click');
                    console.log("Transaction completed.");
                } else {
                    console.log(
                        `Unable to fill to ${targetSecondFill}. Car space: ${carCapacity.current}/${carCapacity.max}, Booze available: ${boozeAvailable.current}/${boozeAvailable.max}.`
                    );
                }
                return; // Exit early since second fill condition was handled
            }
        
            // Regular fill behavior to max capacity
            const fillAmount = Math.min(boozeAvailable.current, availableCarSpace);
        
            // Check conditions
            if (availableCarSpace <= 0) {
                console.log("Car is already full. No space available to top up.");
                return;
            }
        
            if (boozeAvailable.current <= 0) {
                console.log(`No booze available for ID: ${boozeId}.`);
                return;
            }
        
            if (fillAmount > 0) {
                // Fill the car with the determined amount
                $(`input[name='purch[${boozeId}]']`).val(fillAmount);
                console.log(
                    `Filling car with ${fillAmount} crates of booze ID: ${boozeId}. Available booze: ${boozeAvailable.current}, Car space: ${availableCarSpace}.`
                );
        
                // Trigger transaction
                await delay(200);
                $('input[value="Complete transaction!"]').trigger('click');
                console.log("Transaction completed.");
            } else {
                console.log(
                    `Unable to top up. Car space: ${carCapacity.current}/${carCapacity.max}, Booze available: ${boozeAvailable.current}/${boozeAvailable.max}.`
                );
            }
        }
          
        // Attach event listener to "Top Up" buttons
        function attachTopUpListeners() {
            $('.top-up-button').on('click', async function () {
                const boozeId = $(this).data('booze-id');
                console.log(`Top Up button clicked for booze ID: ${boozeId}`);
                await topUpCar(boozeId);
            });
        }

        function attachMostProducedListener() {
            $('.top-up-most-button').on('click', async function () {
                const boozeId = $(this).data('booze-id');
                console.log(`Top Up Most Produced button clicked for booze ID: ${boozeId}`);
                await topUpCar(boozeId);
            });
        }

        function init() {
            addTopUpButtons(); // Adds "++" buttons for each booze
            attachTopUpListeners(); // Attaches listeners to "++" buttons
            // addTopUpMostProducedButton(); // Adds the "Top Up Most Produced" button
            attachMostProducedListener(); // Attaches the listener to the new button
        
            // Fetch the safe-to-travel value
            const safeToTravelWith = getSafeToTravelWith();
            console.log(`Initialized. Safe to travel with: ${safeToTravelWith} crates.`);
        
            console.log("Top Up buttons added and listeners attached.");
        }
        init();
    });
});
