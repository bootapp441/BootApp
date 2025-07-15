document.addEventListener('DOMContentLoaded', function() {
    $(document).ready(function() {
        const element = document.querySelector('.BL-prize-wheel.has-cooldown.BL-timer.BL-timer[data-theme="winter"]');

        if (element) {
            console.log("Element is present.");
        
            // Random delay between 1 and 2.5 seconds (1000 to 2500 milliseconds) for clicking the spin button
            const clickDelay = Math.random() * 1500 + 1000;
        
            setTimeout(() => {
                const spinButton = document.querySelector('.spin');
                if (spinButton) {
                    spinButton.click();
                    console.log("Clicked the spin button after a delay of", clickDelay, "milliseconds.");
                } else {
                    console.log("Spin button not found.");
                }
            }, clickDelay);
        } else {
            console.log("Element is not present.");
        }
        
        // Random delay between 1 hour and 3 seconds (3603 seconds) and 1 hour and 17 seconds (3617 seconds) for page reload
        const minReloadDelay = 3608 * 1000; // in milliseconds
        const maxReloadDelay = 3622 * 1000; // in milliseconds
        const reloadDelay = Math.floor(Math.random() * (maxReloadDelay - minReloadDelay + 1)) + minReloadDelay;
        
        
        setTimeout(() => {
            console.log("Reloading the page after a delay of", reloadDelay / 1000, "seconds.");
            location.reload();
        }, reloadDelay);
        
        console.log("Reloading after 1 hr");
    });
});
