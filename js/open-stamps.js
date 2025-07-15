document.addEventListener('DOMContentLoaded', function() {
    $(document).ready(function() {
        // Create the button and place it under the "Select multiple items?" text
        var openStampButton = `
            <div style="display: flex; gap: 6px; align-items: center;">        
                <br><br>
                <span style="font-size: 10pt; background-color: #a12c13; color: white; font-weight: bold; padding: 0px 5px; border: 1px solid white; border-radius: 10px; cursor: pointer;" 
                    class="open-stamp-collection">
                    Stamps
                </span>
                <br><br>
                <span style="font-size: 10pt; background-color: #a12c13; color: white; font-weight: bold; padding: 0px 5px; border: 1px solid white; border-radius: 10px; cursor: pointer;" 
                    class="car-markdown">
                    Markdown
                </span>
                <br><br>
                <span style="font-size: 10pt; background-color: #a12c13; color: white; font-weight: bold; padding: 0px 5px; border: 1px solid white; border-radius: 10px; cursor: pointer;" 
                    class="open-clean-collection">
                    Clean
                </span>
                <br><br>
            </div>
            `;
                
        // Append the button to the div containing the "Select multiple items?" label
        $('.BL-content-2-inner .items-interface').append(openStampButton);
        console.log("Open Stamp button added to the options section in Character menu only.");

        // Referer URLs
        const Referer = window.location.href;
        console.log(`Using Referer: ${Referer} for the stamp opener.`);

        // Function to process each item with randomized delays
        async function processItems(itemIds) {
            console.log(`Starting to process ${itemIds.length} items.`);

            for (let i = 0; i < itemIds.length; i++) {
                const itemId = itemIds[i];
                
                console.log(`Processing item ${i + 1} with item_id: ${itemId}`);

                try {
                    const response = await fetch("https://www.bootleggers.us/ajax/player.php?action=use-item", {
                        method: "POST",
                        headers: {
                            "Accept": "*/*",
                            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                            "Referer": Referer,
                            "X-Requested-With": "XMLHttpRequest"
                        },
                        body: new URLSearchParams({
                            "item_id": itemId
                        })
                    });
                    const data = await response.json();
                    console.log(`Response for item_id ${itemId}:`, data);
                } catch (error) {
                    console.error(`Error processing item_id ${itemId}:`, error);
                }

                // Random delay between 4.5 and 6.7 seconds
                const delay = Math.random() * (6.7 - 4.5) + 4.5;
                console.log(`Waiting for ${delay.toFixed(2)} seconds before processing the next item.`);
                await new Promise(resolve => setTimeout(resolve, delay * 1000));

                // Additional delay every 4 to 10 items
                if ((i + 1) % (Math.floor(Math.random() * (10 - 4 + 1)) + 4) === 0) {
                    const extraDelay = Math.random() * (12 - 7) + 7;
                    console.log(`Additional delay of ${extraDelay.toFixed(2)} seconds after processing ${i + 1} items.`);
                    await new Promise(resolve => setTimeout(resolve, extraDelay * 1000));
                }
            }

            console.log("All items processed.");
        }

        // Add click event listener to the dynamically created button
        $(document).on('click', '.open-stamp-collection', function() {
            console.log("Open Stamp button clicked.");

            // Select all elements with the class "BL-item" and filter by data-id="136"
            const items = document.querySelectorAll('.BL-item[data-id="136"]');
            const itemIds = Array.from(items).map(item => item.getAttribute('data-player-item-id'));

            console.log(`Found ${itemIds.length} items with data-id="136".`, itemIds);

            // Start processing items with randomized delays
            processItems(itemIds);
        });
    });
});
