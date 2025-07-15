document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        $('.sub3:contains("Inventory space used")').contents().filter(function () { return this.nodeType === 3 && this.nodeValue.trim() === "Inventory space used"; }).remove();

        const carDisplayTd = $('.car-display').closest('td'); // Locate the TD containing .car-display

        if (carDisplayTd.length) {
            const parentRow = carDisplayTd.closest('tr'); // Locate the parent <tr>
            const parentTable = carDisplayTd.closest('table'); // Locate the parent table

            // Ensure the table does not auto-adjust column widths
            parentTable.css('table-layout', 'fixed');

            // Create a new <td> for the left column
            const newLeftTd = document.createElement('td');
            newLeftTd.className = 'extraColumn';
            newLeftTd.setAttribute('colspan', '2'); // Set colspan="1"
            newLeftTd.style.verticalAlign = 'top'; // Align content at the top
            newLeftTd.style.padding = '5px'; // Optional spacing for aesthetics

            // Create the container for buttons inside the new <td>
            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.flexDirection = 'column';
            buttonContainer.style.alignItems = 'flex-start';

            // Define the button content
            const selectionOptions = `
                <div style="text-align: left;">
                    <span style="
                        font-size: 10pt; 
                        background-color: rgba(61, 153, 112, 0.8); 
                        color: white; 
                        font-weight: bold; 
                        padding: 0px 5px; 
                        border: 1px solid white; 
                        border-radius: 10px; 
                        cursor: pointer; 
                        display: inline-block; 
                        text-align: center; 
                        margin-bottom: 5px;"
                        class="get-first-best">
                        Drive Best Car
                    </span> 
                </div>
            `;

            // Insert buttons into the new left column
            buttonContainer.innerHTML = selectionOptions;
            newLeftTd.appendChild(buttonContainer);

            // Insert the new <td> before the existing car display <td>
            carDisplayTd.before(newLeftTd);
            console.log("Added new left column with colspan='2' and buttons.");

            // Now add the "++ Most" button inside this left column
            addTopUpMostProducedButton(newLeftTd);
            addTrainReady(newLeftTd);
            addDriveReady(newLeftTd);
            addDriveUnReady(newLeftTd);
        } else {
            console.log("No '.car-display' found in the DOM.");
        }
    });

    // Function to add "Top Up Most Produced" button inside the left column
    function addTopUpMostProducedButton(containerElement) {
        const mostProducedBoozeId = getMostProducedBoozeUnderValue(150); // Limit boozeValue to 150
        if (!mostProducedBoozeId) return;

        const buttonHtml = `<div style="text-align: left;">
            <span class="top-up-most-button" data-booze-id="${mostProducedBoozeId}"
                  style="font-size: 10pt; background-color: rgba(61, 153, 112, 0.8);
                         color: white; font-weight: bold; padding: 0px 5px;
                         border: 1px solid white; border-radius: 10px; cursor: pointer;
                         display: inline-block; text-align: center; margin-bottom: 5px;">
                Refill
            </span>
        </div>`;

        // Append to the passed-in container
        $(containerElement).append(buttonHtml);
        console.log('Top Up Most Produced button appended inside extraColumn.');
    }

    function addTrainReady(containerElement) {
        const buttonHtml = `<div style="text-align: left;">
            <span class="train-ready"
                    style="font-size: 10pt; background-color: rgba(61, 153, 112, 0.8);
                            color: white; font-weight: bold; padding: 0px 5px;
                            border: 1px solid white; border-radius: 10px; cursor: pointer;
                            display: inline-block; text-align: center; margin-bottom: 5px;">
                Take Train
            </span>
        </div>`;

        // Append to the passed-in container
        $(containerElement).append(buttonHtml);
        console.log('Train Ready button appended.');
    }

    function addDriveReady(containerElement) {
        const buttonHtml = `<div style="text-align: left;">
            <span class="drive-ready"
                    style="font-size: 10pt; background-color: rgba(61, 153, 112, 0.8);
                            color: white; font-weight: bold; padding: 0px 5px;
                            border: 1px solid white; border-radius: 10px; cursor: pointer;
                            display: inline-block; text-align: center; margin-bottom: 5px;">
                Go Drive
            </span>
        </div>`;

        // Append to the passed-in container
        $(containerElement).append(buttonHtml);
        console.log('Drive Ready button appended.');
    }

    function addDriveUnReady(containerElement) {
        const buttonHtml = `<div style="text-align: left;">
            <span class="drive-un-ready"
                    style="font-size: 10pt; background-color: rgba(61, 153, 112, 0.8);
                            color: white; font-weight: bold; padding: 0px 5px;
                            border: 1px solid white; border-radius: 10px; cursor: pointer;
                            display: inline-block; text-align: center; margin-bottom: 5px;">
                1 Lemo
            </span>
        </div>`;

        // Append to the passed-in container
        $(containerElement).append(buttonHtml);
        console.log('Drive Ready button appended.');
    }

    // Function to get the most produced booze under a value limit
    function getMostProducedBoozeUnderValue(limit = 150) {
        const cityName = $('.city-name').text().trim();
        let maxBooze = null;
        let maxStock = 0;

        $('.booze-cell').each(function () {
            const boozeId = $(this).data('booze-id');
            const boozeValue = getBoozeValue(boozeId);
            const boozeLabel = $(this).find('.name').text().trim();
            const { current } = getAvailableBooze(boozeId);

            // Exclude specific booze based on city conditions
            if ((cityName === "New York City" && boozeLabel === "Beer") ||
                (cityName === "New Orleans" && boozeLabel === "Bourbon")) {
                console.log(`Skipping ${boozeLabel} in ${cityName}`);
                return;
            }

            // Check if boozeValue < limit and has the highest current stock
            if (boozeValue < limit && current > maxStock) {
                maxStock = current;
                maxBooze = boozeId;
            }
        });

        if (maxBooze !== null) {
            console.log(`Most produced booze found: ID ${maxBooze} with stock ${maxStock} and value under ${limit}`);
            return maxBooze;
        } else {
            console.warn(`No booze found with value under ${limit} and available stock.`);
            return null;
        }
    }

    // Function to get the booze value
    function getBoozeValue(boozeId) {
        const divText = $(`.booze-price.booze-${boozeId}`).text().trim();
        const prunedText = divText.replace(/[^0-9]/g, '');
        return parseInt(prunedText, 10) || 0;
    }

    // Function to get available booze stock
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
});
