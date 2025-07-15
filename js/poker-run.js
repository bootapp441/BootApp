document.addEventListener('DOMContentLoaded', function() {
    $(document).ready(function() {
        function randomDelay(min, max) {
            return Math.random() * (max - min) + min;
        }
        
        // Function to check for the presence of the thanks-container div with class "show"
        function isThanksContainerPresent() {
            return document.querySelector('.thanks-container.show') !== null;
        }
        
        // Function to perform clicks on welcome-container until the thanks-container div appears
        function clickWelcomeContainer() {
            if (!isThanksContainerPresent()) {
                document.querySelector('.welcome-container').click();
                
                // Schedule the next click with a random delay between 0.110 and 0.330 seconds
                setTimeout(clickWelcomeContainer, randomDelay(110, 330));
            } else {
                // Perform additional random 3 - 6 clicks after detection
                let extraClicks = Math.floor(Math.random() * (6 - 3 + 1)) + 3; // Random number between 3 and 6
                let count = 0;
        
                function performExtraClicks() {
                    if (count < extraClicks) {
                        document.querySelector('.welcome-container').click();
                        count++;
                        setTimeout(performExtraClicks, randomDelay(200, 400));
                    }
                }
        
                performExtraClicks();
            }
        }
        
        // Event listener to start the sequence on manual click of .tab[data-select="how-to-play"]
        document.querySelector('.tab[data-select="how-to-play"]').addEventListener('click', () => {
            // Start clicking on welcome-container with the defined intervals
            setTimeout(clickWelcomeContainer, randomDelay(500, 1500));
        });
    });
});
