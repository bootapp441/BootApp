document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        function isLoadingIconVisible() {
            const loadingIcons = document.querySelectorAll('.loading-icon');
            return Array.from(loadingIcons).some(icon => {
                const style = window.getComputedStyle(icon);
                return style.display !== 'none' && style.visibility !== 'hidden' && icon.offsetHeight > 0;
            });
        }

        function isCaptchaPending() {
            // Check for commonly used CAPTCHA elements
            const captchaElements = document.querySelectorAll('iframe[src*="captcha"], input[name="captcha"], .g-recaptcha, #captcha, .captcha');
            if (captchaElements.length > 0) {
                console.log("CAPTCHA detected: Challenge pending.");
                return true;
            }

            // Check for Google's reCAPTCHA response token (if applicable)
            if (typeof grecaptcha !== 'undefined' && grecaptcha.getResponse) {
                if (!grecaptcha.getResponse()) {
                    console.log("CAPTCHA detected: reCAPTCHA challenge unresolved.");
                    return true;
                }
            }

            return false;
        }

        function simulateHyperlinkClick() {
            console.log("Redirecting to: https://www.bootleggers.us/crimes.php");
            window.location.href = "https://www.bootleggers.us/crimes.php";
        }

        // Monitor loading icon visibility
        let visibilityDuration = 0;
        const interval = 500; // Check every 500ms
        const maxDuration = 7000; // Maximum duration (7 seconds)

        setInterval(() => {
            if (isLoadingIconVisible()) {
                visibilityDuration += interval;
                if (visibilityDuration >= maxDuration) {
                    console.warn("Loading icon visible for more than 7 seconds.");

                    if (isCaptchaPending()) {
                        console.log("Unresolved CAPTCHA detected. Skipping reload/redirect.");
                    } else {
                        // Wait for a random 2-4 seconds, then simulate hyperlink click or reload
                        const randomDelay = Math.random() * 2000 + 2000; // Random delay between 2000ms and 4000ms
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
                    }

                    // Reset the visibility duration to continue monitoring
                    visibilityDuration = 0;
                }
            } else {
                // Reset visibility duration if no loading icon is visible
                visibilityDuration = 0;
            }
        }, interval);
    });
});
