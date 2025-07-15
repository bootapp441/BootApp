document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {        
        function checkAndPressJailMeButton() {
            // Check if the "Put me in jail!" button exists
            const jailMeButton = document.querySelector('.jail-me-button'); 
            if (!jailMeButton) {
                console.log("No 'Put me in jail!' button found.");
                return;
            }

            // Get all inmates and exclude "CharlesMcCown"
            const allInmates = Array.from(document.querySelectorAll('.inmates .inmate'));
            const inmates = allInmates.filter(inmate => {
                const player = inmate.querySelector('.BL-player');
                return player && player.dataset.username !== "CharlesMcCown";
            });

            // Check if there are any remaining inmates
            if (inmates.length === 0) {
                console.log("No inmates found (excluding 'CharlesMcCown'). Pressing 'Put me in jail!' button...");

                // Introduce a random delay between 80ms and 110ms
                const randomDelay = Math.random() * (110 - 80) + 80;
                setTimeout(() => {
                    jailMeButton.click();
                    console.log("'Put me in jail!' button pressed.");
                }, randomDelay);
            }

            // Recheck the DOM every 50ms
            setTimeout(checkAndPressJailMeButton, 75);
        }

        // Start the process
        checkAndPressJailMeButton();
    });
});
