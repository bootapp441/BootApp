document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        // ------------------------------------------------------------------
        // 1) GLOBALS + CAPTCHA DETECTION
        // ------------------------------------------------------------------

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
            console.log("[Captcha] Detected, clicks and reloads paused until solved.");
        }

        // All possible city names (make sure these match in-game city labels)
        const ALL_CITIES = [
            "Atlantic City",
            "Chicago",
            "Cincinnati",
            "New Orleans",
            "New York City",
            "Rocky Mount",
            "Detroit"
        ];

        // Function to simulate a hyperlink click
        function simulateHyperlinkClick() {
            const hyperlink = document.createElement('a');
            hyperlink.href = window.location.href; // Current page URL
            hyperlink.click();
        }

        // ------------------------------------------------------------------
        // 2) ONLY CONTINUE IF NO CAPTCHA
        // ------------------------------------------------------------------

        // if (isCaptchaActive()) { handleCaptchaDetected(); return; }

        // ------------------------------------------------------------------
        // 3) IDLE MODE LOGIC (REFRESHES)
        // ------------------------------------------------------------------

        let idleMode = false;
        let idleTimeout;
        const idleDuration = 1 * 60 * 1000; // 1 minute

        // Start detecting idle
        function startIdleDetection() {
            clearTimeout(idleTimeout);
            idleTimeout = setTimeout(enableIdleMode, idleDuration);
        }

        function enableIdleMode() {
            idleMode = true;
            console.log('Idle mode enabled');
            refreshAtRandomTimes();
        }

        function disableIdleMode() {
            if (idleMode) {
                idleMode = false;
                console.log('Idle mode disabled');
            }
            startIdleDetection();
        }

        // User interaction ends idle mode
        $(document).on('mousemove keydown click scroll', function () {
            disableIdleMode();
        });

        // Start idle detection on page load
        startIdleDetection();

        // [UI] Create Spike Alert Toggle
        const thirdSub3 = $('.sub3').eq(2);
        const spikeContainer = $('<div style="text-align: left; margin-bottom: 5px;"></div>');

        const spikeCheckbox = document.createElement('input');
        spikeCheckbox.type = 'checkbox';
        spikeCheckbox.id = 'spikeCheckbox';
        spikeCheckbox.checked = (localStorage.getItem('spikeAlerting') !== 'false'); // default ON if not set

        const spikeLabel = document.createElement('label');
        spikeLabel.setAttribute('for', 'spikeCheckbox');
        spikeLabel.textContent = ' Spike/No-Spike Webhook Calling';

        spikeContainer.append(spikeCheckbox);
        spikeContainer.append(spikeLabel);
        thirdSub3.append(spikeContainer);

        spikeCheckbox.addEventListener('change', function () {
            localStorage.setItem('spikeAlerting', this.checked);
            console.log('Spike alerting is now:', this.checked);
        });
        console.log('Spike Alerting checkbox appended.');

        // Function to refresh page at random times in idle mode
        function refreshAtRandomTimes() {
            if (!idleMode) return;

            const date = new Date();
            const currentMinute = date.getMinutes();

            if (isCaptchaActive()) {
                handleCaptchaDetected();
                // Try again after 30 seconds if captcha is blocking refresh
                setTimeout(refreshAtRandomTimes, 10 * 1000);
                return;
            }

            // Check if we're in one of the six specific time intervals
            const timeRanges = [
                { min: 1, max: 2 },
                { min: 10, max: 12 },
                { min: 21, max: 22 },
                { min: 30, max: 32 },
                { min: 41, max: 42 },
                { min: 50, max: 52 }
            ];

            const isInTimeRange = timeRanges.some(range => currentMinute >= range.min && currentMinute <= range.max);

            if (isInTimeRange) {
                const randomDelay = Math.floor(Math.random() * 2 * 60 * 1000); // up to 2 min
                setTimeout(() => {
                    if (idleMode) {
                        if (isCaptchaActive()) {
                            handleCaptchaDetected();
                            // Try again after 30 seconds if captcha is blocking refresh
                            setTimeout(refreshAtRandomTimes, 10 * 1000);
                            return;
                        }

                        // 70% chance hyperlink click, 30% reload
                        const randomChance = Math.random();
                        if (randomChance < 0.7) {
                            console.log("Simulating hyperlink click to reload the page (70% chance)");
                            simulateHyperlinkClick();
                        } else {
                            console.log("Using location.reload() to refresh the page (30% chance)");
                            location.reload();
                        }
                    }
                }, randomDelay);
            }
            // Check again in ~33s
            setTimeout(refreshAtRandomTimes, 33 * 1000);
        }

        // ------------------------------------------------------------------
        // 4) DETERMINE CURRENT TIMESLOT (0,1,2) + TIME LEFT
        // ------------------------------------------------------------------

        let spikeDetected = false;
        var cityName = $('.city-name').text().trim();
        var username = $('.username').text().trim();

        const now = new Date();
        const min = now.getMinutes();
        const currentHour = now.getHours();
        const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

        let timeLeft = 0;
        let currentSlot = 0;

        // Determine timeslot based on minutes (3 slots: 0-19, 20-39, 40-59)
        if (min < 20) {
            timeLeft = 20 - min;
            currentSlot = 0;
        } else if (min < 40) {
            timeLeft = 40 - min;
            currentSlot = 1;
        } else {
            timeLeft = 60 - min;
            currentSlot = 2;
        }

        // ------------------------------------------------------------------
        // 5) REMOVE OLD ALERTS IF WE'RE IN A NEW SLOT/HOUR/DATE
        // ------------------------------------------------------------------

        const currentSlotIdentifier = `${currentSlot}_${currentHour}_${currentDate}`;
        const lastSlot = localStorage.getItem('lastSlot');

        if (lastSlot === null || lastSlot !== currentSlotIdentifier) {
            // It's a new timeslot, hour, or day => remove outdated keys
            removeOldAlerts(currentSlot, currentHour, currentDate);
            // Update
            localStorage.setItem('lastSlot', currentSlotIdentifier);
        }

        /**
         * Removes ALL outdated localStorage keys for ANY city that do not match
         * the current slot/hour/date. Also removes any unknown keys.
         */
        function removeOldAlerts(newSlot, newHour, newDate) {
            Object.keys(localStorage).forEach(key => {
                // Skip special or unrelated keys
                if (key === 'lastSlot') return;

                // Try to match "CityName_" from your known city list
                const matchedCity = ALL_CITIES.find(city => key.startsWith(city + "_"));
                if (!matchedCity) {
                    // This key doesn't start with any city in ALL_CITIES,
                    // so we skip removal. We leave it intact.
                    return;
                }

                // Remove the city portion, parse remainder: "slot_hour_date"
                const remainder = key.replace(matchedCity + "_", "");
                const parts = remainder.split("_"); // Expect [slot, hour, date]

                if (parts.length !== 3) {
                    // If it doesn't have exactly 3 parts, it's not a valid "City_slot_hour_date" pattern.
                    // You might remove it to avoid stale keys, or skip if you want to preserve unknown.
                    // Typically, let's remove to keep things clean:
                    localStorage.removeItem(key);
                    console.log("Removed malformed city-based key:", key);
                    return;
                }

                const [slotStr, hourStr, dateStr] = parts;
                const slotNum = parseInt(slotStr, 10);
                const hourNum = parseInt(hourStr, 10);

                // If the slot, hour, or date doesn't match the current time,
                // remove it because it's outdated.
                if (
                    slotNum !== newSlot ||
                    hourNum !== newHour ||
                    dateStr !== newDate
                ) {
                    localStorage.removeItem(key);
                    console.log("Removed old city-based key:", key);
                }
            });
        }

        // ------------------------------------------------------------------
        // 6) CHECK BOOZE PRICES; FLAG ANY SPIKE
        // ------------------------------------------------------------------

        // If Rocky Mount, only check booze 1 & 2, otherwise check 1..6
        let boozeToCheck = (cityName === 'Rocky Mount') ? [1, 2] : [1, 2, 3, 4, 5, 6];

        for (let i of boozeToCheck) {
            const divText = $('.booze-price.booze-' + i).text().trim();
            const prunedText = divText.replace(/[^0-9]/g, '');
            const boozeValue = parseInt(prunedText, 10);

            if (boozeValue > 900) {
                spikeDetected = true;
                // Apply fancy styling
                $('.booze-price.booze-' + i).css({
                    'background-image': 'url(https://i.imgur.com/IV3ziar.gif)',
                    'font-weight': 'bold',
                    'text-shadow': '#FC0 1px 0 10px'
                });
            }
        }

        // ------------------------------------------------------------------
        // 7) SEND ALERTS (SPIKE OR NO-SPIKE) ONLY ONCE PER CITY+SLOT+HOUR+DATE
        // ------------------------------------------------------------------

        // Build the new, more unique alert key
        const alertKey = `${cityName}_${currentSlot}_${currentHour}_${currentDate}`;
        const alertSent = localStorage.getItem(alertKey);

        const webhookURLspike = localStorage.getItem('discord.webhook.5');     // Booze Spike
        const webhookURLnospike = localStorage.getItem('discord.webhook.6');   // Booze NoSpike
        const discordEnabled = localStorage.getItem('discord.enabled') === 'true';

        const spikeAlertingEnabled = (localStorage.getItem('spikeAlerting') !== 'false');

        // Only send if we haven't yet for this city+slot+hour+date
        if (!alertSent) {
            let anySpike = false; // track if we actually found a spike

            // Check again which booze items > 900
            for (let i of boozeToCheck) {
                const divText = $('.booze-price.booze-' + i).text().trim();
                const prunedText = divText.replace(/[^0-9]/g, '');
                const boozeValue = parseInt(prunedText, 10);

                if (boozeValue > 900) {
                    anySpike = true;
                    const boozeArray = {
                        1: 'Moonshine',
                        2: 'Beer',
                        3: 'Gin',
                        4: 'Whiskey',
                        5: 'Rum',
                        6: 'Bourbon'
                    };
                    const boozeName = boozeArray[i] || 'Booze #' + i;
                    const data = {
                        content: '',
                        embeds: [{
                            description: `**${boozeName}** in **${cityName}** at **$${boozeValue}** -- **${timeLeft} minutes** left. (${username})`,
                            color: 5763719
                        }]
                    };

                    // Send Spike
                    if (spikeAlertingEnabled) {
                        if (discordEnabled && webhookURLspike) {

                            $.ajax({
                                url: webhookURLspike,
                                method: 'POST',
                                contentType: 'application/json',
                                data: JSON.stringify(data),
                                success: function () { console.log('Successfully reported the Spike!'); },
                                error: function (xhr, status, error) { console.error('Error reporting spike:', error); }
                            });
                        }

                        // Also send to noSpike to track it
                        if (discordEnabled && webhookURLnospike) {

                            $.ajax({
                                url: webhookURLnospike,
                                method: 'POST',
                                contentType: 'application/json',
                                data: JSON.stringify(data),
                                success: function () { console.log('Successfully reported the noSpike!'); },
                                error: function (xhr, status, error) { console.error('Error reporting spike:', error); }
                            });
                        }
                    }
                }
            }

            // If we found no spikes, send a no-spike alert
            if (!anySpike) {
                const data = {
                    content: '',
                    embeds: [{
                        description: `**${cityName}** has no spikes for **${timeLeft} minutes**. (${username})`,
                        color: 10038562
                    }]
                };

                if (discordEnabled && webhookURLnospike) {
                    $.ajax({
                        url: webhookURLnospike,
                        method: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(data),
                        success: function () { console.log('No spike alert sent successfully!'); },
                        error: function (xhr, status, error) {
                            console.error('Error sending no spike alert:', xhr.status, xhr.responseText, error);
                        }
                    });
                }
            }

            // Mark that we've sent for this city+slot+hour+date
            localStorage.setItem(alertKey, 'true');
        }
    });
});
