document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        let idleDuration = 10 * 1000; // 10 seconds
        let idleTimeout;
        let idleMode = false;

        /* ======== CAPTCHA CHECK HELPDER SCRIPTS ======== */
        function isCaptchaActive() {
            const solving = localStorage.getItem('captcha.solving') === 'true';
            const solvingSince = parseInt(localStorage.getItem('captcha.solvingStartedAt') || '0', 10);
            const solvedAt = parseInt(localStorage.getItem('captcha.solvedAt') || '0', 10);
            const blockDuration = parseInt(localStorage.getItem('captcha.blockDuration') || '120000', 10);
            const now = Date.now();
        
            // If solving started recently, we block actions
            if (solvingSince && (now - solvingSince < blockDuration)) {
                return true;
            }
        
            // If solving was completed recently, still block actions temporarily
            if (solvedAt && (now - solvedAt < blockDuration)) {
                return true;
            }
        
            return false;
        }

        function handleCaptchaDetected() {
            if (!isCaptchaActive()) return;
            console.log("[Captcha] Detected, clicks paused until solved.");
        }

        /* ======== GEN LOGIC ======== */
        function startIdleDetection() {
            clearTimeout(idleTimeout);
            idleTimeout = setTimeout(enableIdleMode, idleDuration);
        }

        function enableIdleMode() {
            idleMode = true;
            console.log("Idle mode enabled [Nego]");
        }

        function disableIdleMode() {
            if (idleMode) {
                idleMode = false;
                console.log("Idle mode disabled");
            }
            startIdleDetection();
        }

        $(document).on('mousemove keydown click scroll', function () {
            disableIdleMode();
        });

        startIdleDetection();

        var cityName = $('.city-name').text().trim();

        let boozeArray = (cityName === 'Rocky Mount')
            ? [{ id: 1, label: 'Moonshine' }, { id: 2, label: 'Beer' }]
            : [
                { id: 1, label: 'Moonshine' },
                { id: 2, label: 'Beer' },
                { id: 3, label: 'Gin' },
                { id: 4, label: 'Whiskey' },
                { id: 5, label: 'Rum' },
                { id: 6, label: 'Bourbon' }
            ];

        function checkForSpike() {
            let spikeDetected = false;
            for (let booze of boozeArray) {
                let divText = $('.booze-price.booze-' + booze.id).text().trim();
                let prunedText = divText.replace(/[^0-9]/g, '');
                let boozeValue = parseInt(prunedText, 10);

                const threshold = parseInt(localStorage.getItem('negotiateSpikeThreshold')) || 1500;
                if (boozeValue > threshold) {
                    spikeDetected = true;
                    console.log(`Spike detected for ${booze.label} with price ${boozeValue} (threshold: ${threshold})`);
                    break;
                }

            }
            return spikeDetected;
        }

        function getCurrentTimeSlot() {
            let currentMinute = new Date().getMinutes();
            if (currentMinute >= 0 && currentMinute < 20) {
                return 1; // Slot 1
            } else if (currentMinute >= 20 && currentMinute < 40) {
                return 2; // Slot 2
            } else {
                return 3; // Slot 3
            }
        }

        // Updated parseTimerText function to handle HH:MM:SS format
        function parseTimerText(timerText) {
            let [hours, minutes, seconds] = timerText.split(':').map(Number);
            if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
                return hours * 3600 + minutes * 60 + seconds; // Convert HH:MM:SS to total seconds
            }
            return 0;
        }

        function reReadDOMAndStartNegotiation() {
            let initialTimeSlot = getCurrentTimeSlot();

            // Updated negotiationAttempt function
            function negotiationAttempt() {
                // Check for captcha
                // if (isCaptchaActive()) { handleCaptchaDetected(); return; }

                // Dynamically fetch the current slot
                let currentSlot = getCurrentTimeSlot();
                if (currentSlot !== initialTimeSlot) {
                    console.log(`Time slot has changed from ${initialTimeSlot} to ${currentSlot}. Stopping negotiation routine.`);
                    return; // Exit if time slot has changed
                }

                // Check if timer is active
                let timerElement = $('.price-negotiate.BL-timer-active .BL-timer-display');
                if (timerElement.length > 0) {
                    let timerText = timerElement.text().trim();
                    let remainingTime = parseTimerText(timerText);
                    console.log(`Negotiation timer is active. Waiting for ${remainingTime} seconds.`);
                    setTimeout(negotiationAttempt, (remainingTime + 3) * 1000); // Retry after timer expires
                    return;
                }

                // Check for the "You cannot negotiate yet!" message
                let errorMessage = $('body').find('*:contains("You cannot negotiate yet!")');
                if (errorMessage.length > 0) {
                    console.log("Message found: 'You cannot negotiate yet!'. Checking timer...");
                    let timerText = $('.price-negotiate.BL-timer-display').text().trim();
                    let remainingTime = parseTimerText(timerText);

                    if (remainingTime > 0) {
                        console.log(`Waiting for ${remainingTime} seconds until the next negotiation attempt.`);
                        setTimeout(negotiationAttempt, (remainingTime + 3) * 1000); // Retry after timer
                    } else {
                        console.log("Timer not found or invalid. Retrying after 5 seconds.");
                        setTimeout(negotiationAttempt, 5000); // Retry after 5 seconds
                    }
                    return;
                }

                // Continue with negotiation process if no timer is active
                let radioButton = $('input[name="negotiate"][value="higher"]');
                if (radioButton.length > 0) {
                    radioButton.prop('checked', true);
                    $('.price-negotiate .actions input[type="submit"]').click();
                    console.log("Negotiation submitted for higher prices.");
                } else {
                    console.log("Radio button for higher not found. Re-reading DOM...");
                }

                setTimeout(negotiationAttempt, 2000); // Retry after 2 seconds
            }
            setTimeout(negotiationAttempt, 2000);
        }

        // Add toggle checkbox for negotiation
        const negotiateHeader = $('td.header:contains("Negotiate prices")');
        if (negotiateHeader.length) {
            negotiateHeader.html(`
                <label>
                    <input type="checkbox" id="enableAutoNegotiate">
                    <span>Auto Negotiate prices at spike</span>
                    <input type="number" id="negotiateSpikeThreshold" min="100" step="50" style="width: 70px;">
                </label>
            `);
         
            const threshold = parseInt(localStorage.getItem('negotiateSpikeThreshold')) || 1500;
            $('#negotiateSpikeThreshold').val(threshold);
            $('#negotiateSpikeThreshold').on('change', function () {
                const val = parseInt(this.value);
                if (!isNaN(val)) {
                    localStorage.setItem('negotiateSpikeThreshold', val);
                }
            });

            const setting = localStorage.getItem('enableAutoNegotiate');
            const isEnabled = setting === null ? true : setting === 'true';
            $('#enableAutoNegotiate').prop('checked', isEnabled);

            $('#enableAutoNegotiate').on('change', function () {
                localStorage.setItem('enableAutoNegotiate', this.checked);
            });
        }

        setInterval(function () {
            // if (!isCaptchaActive() && idleMode) {
            if (idleMode && (localStorage.getItem('enableAutoNegotiate') === 'true')) {
                let spikeDetected = checkForSpike();
                if (spikeDetected) {
                    console.log("Spike detected and browser is idle. Starting negotiation routine.");
                    reReadDOMAndStartNegotiation();
                }
            }
        }, 5000); // Check every 5 seconds
    });
});
