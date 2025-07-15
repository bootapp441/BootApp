document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        function checkAndRefresh() {
            // Define the phrases to look for
            const phrases = [
                "You need to deal",
                // "You are in jail",
                "You are not in jail",
                "This crime is not available here",
                "The crime is not available here",
                "Please retry",
                "You are not in a jam",
                "The crime is cooling down!"
            ];

            // Check the document body for any of the phrases
            const bodyText = document.body.innerText;
            const foundPhrase = phrases.some(phrase => bodyText.includes(phrase));

            if (foundPhrase) {
                console.log("Found a matching phrase. Refreshing the page...");
                // Wait for a random 2-4 seconds, then refresh or reload
                const randomDelay = Math.random() * 2000 + 2000; // 2000ms to 4000ms
                setTimeout(() => {
                    const randomChance = Math.random();
                    if (randomChance < 0.7) {
                        console.log("Simulating hyperlink click to reload the page (70% chance)");
                        simulateHyperlinkClick();
                    } else {
                        console.log("Using location.reload() to refresh the page (30% chance)");
                        location.reload();
                    }
                }, randomDelay);
            } else {
                // console.log("No matching phrase found. Checking again...");
            }
        }

        // Function to simulate a hyperlink click
        function simulateHyperlinkClick() {
            const link = document.createElement('a');
            link.href = window.location.href;
            document.body.appendChild(link);
            link.click();
        }

        // Check every 0.2 seconds
        setInterval(checkAndRefresh, 200);

        // Function to simulate a hyperlink click
        function reload() {
            const randomChance = Math.random();
            if (randomChance < 0.7) {
                console.log("Simulating hyperlink click to reload the page (70% chance)");
                simulateHyperlinkClick();
            } else {
                console.log("Using location.reload() to refresh the page (30% chance)");
                location.reload();
            }
        }
        
        // Random delay between 20 and 40 minutes
        const delayReload = Math.random() * (40 - 20) * 60 * 1000 + 20 * 60 * 1000;

        // Random reload 20 - 40 minutes
        setTimeout(() => {
            reload();
        }, delayReload);
    });
});
