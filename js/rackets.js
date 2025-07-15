document.addEventListener('DOMContentLoaded', function() {
    $(document).ready(function() {

        const collectButton = '<center><br><br><button id="collectButton" style="font-size: 10pt; background-color: #a12c13; color: white; font-weight: bold; border: 1px solid white; border-radius: 10px;" class=" ">Collect all uncollected profits</button><br><br></center>';

        $(collectButton).appendTo('.racket-stats');

        $('#collectButton').on('click', function() {
            const collectAreas = document.querySelectorAll('.collect-area[data-action="collect"]');
            
            // Check if the city amount is "$0" and exit if true
            const cityAmountElement = document.querySelector('.totals .amount.city');
            
            // Debug: Check if cityAmountElement exists and its value
            if (!cityAmountElement) {
                console.log("City amount element not found.");
                return;
            }
            
            let cityAmount = cityAmountElement.innerText.trim();
            console.log("City amount detected:", cityAmount); // Debugging line

            // Remove non-numeric characters for comparison
            const numericCityAmount = parseFloat(cityAmount.replace(/[^0-9.-]+/g, ''));
            if (numericCityAmount === 0) {
                console.log("Skipping collection as the city amount is $0.");
                return; // Exit the collection function if city amount is $0
            }

            let index = 0;
            let collectionCount = 0;

            function processCollection() {
                if (index < collectAreas.length) {
                    const uncollectedProfit = collectAreas[index].querySelector('.uncollected').innerText;

                    if (uncollectedProfit !== "$0") {
                        collectAreas[index].click();
                        collectionCount++;

                        let delay;
                        if (collectionCount >= 2 && Math.random() > 0.5) {
                            delay = Math.random() * (3000 - 2000) + 2000;
                            collectionCount = 0;
                        } else {
                            delay = Math.random() * (2000 - 1000) + 1000;
                        }

                        setTimeout(processCollection, delay);
                    } else {
                        index++;
                        processCollection();
                    }
                }
            }

            processCollection();
        });

        // Random delay between 1 - 3 seconds before triggering the collect button click
        const randomDelay = Math.random() * (3000 - 1000) + 1000;
        setTimeout(() => {
            $('#collectButton').click();
        }, randomDelay);

        // Function to simulate hyperlink click
        function simulateHyperlinkClick() {
            const link = document.createElement('a');
            link.href = window.location.href;
            link.click();
        }

        // Random reload or refresh every 10 - 50 minutes
        const randomReloadTime = Math.random() * (3000000 - 600000) + 600000; // 10 to 50 minutes in milliseconds
        setTimeout(() => {
            const randomChance = Math.random();
            if (randomChance < 0.7) {
                console.log("Simulating hyperlink click to reload the page (70% chance)");
                simulateHyperlinkClick();
            } else {
                console.log("Using location.reload() to refresh the page (30% chance)");
                location.reload();
            }
        }, randomReloadTime);

    });
});
