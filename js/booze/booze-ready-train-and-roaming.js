document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {

        // =====================
        // 1) Roaming Setup
        // =====================
        const cityToIdMap = {
            "CHI": 1,
            "DT": 2,
            "CIN": 3,
            "NYC": 4,
            "NO": 5,
            "AC": 6,
            "RM": 8,
        };

        const cityNameToKeyMap = {
            "Chicago": "CHI",
            "Detroit": "DT",
            "Cincinnati": "CIN",
            "New York City": "NYC",
            "New Orleans": "NO",
            "Atlantic City": "AC",
            "Rocky Mount": "RM",
        };

        const thirdSub3 = $('.sub3').eq(2); // Where to place our UI
        const roamingContainer = $('<div style="text-align:left; margin-bottom:5px;"></div>');

        const roamingCheckbox = document.createElement('input');
        roamingCheckbox.type = 'checkbox';
        roamingCheckbox.id = 'roamingCheckbox';
        roamingCheckbox.checked = (localStorage.getItem('roamingEnabled') === 'true');

        const roamingLabel = document.createElement('label');
        roamingLabel.setAttribute('for', 'roamingCheckbox');
        roamingLabel.textContent = ' Spike Call Roaming | Enabled Cities ';

        roamingContainer.append(roamingCheckbox);
        roamingContainer.append(roamingLabel);

        // Add city checkboxes
        const cityCheckboxes = {};
        Object.keys(cityToIdMap).forEach(key => {
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.id = 'roam_' + key;
            cb.checked = (localStorage.getItem('roamCity_' + key) === 'true');

            const label = document.createElement('label');
            label.setAttribute('for', 'roam_' + key);
            label.textContent = ' ' + key + ' ';

            roamingContainer.append(cb);
            roamingContainer.append(label);
            cityCheckboxes[key] = cb;
        });

        // Extra Train Mode Option (Train Ready Always)
        const trainModeContainer = $('<div style="text-align:left; margin-bottom:5px;"></div>');

        const extraTrainCheckbox = document.createElement('input');
        extraTrainCheckbox.type = 'checkbox';
        extraTrainCheckbox.id = 'extraTrainMode';
        extraTrainCheckbox.checked = (localStorage.getItem('extraTrainMode') === 'true');

        const extraTrainLabel = document.createElement('label');
        extraTrainLabel.setAttribute('for', 'extraTrainMode');
        extraTrainLabel.textContent = ' Train Ready Always ';

        trainModeContainer.append(extraTrainCheckbox);
        trainModeContainer.append(extraTrainLabel);
        thirdSub3.append(trainModeContainer);

        extraTrainCheckbox.addEventListener('change', function () {
            localStorage.setItem('extraTrainMode', this.checked);
        });

        thirdSub3.append(roamingContainer);

        // Save roaming enabled checkbox
        roamingCheckbox.addEventListener('change', function () {
            localStorage.setItem('roamingEnabled', this.checked);
        });

        // Save each city checkbox
        Object.keys(cityCheckboxes).forEach(key => {
            cityCheckboxes[key].addEventListener('change', function () {
                localStorage.setItem('roamCity_' + key, this.checked);
            });
        });

        // Store traveled cities for this timeslot
        const now = new Date();
        const min = now.getMinutes();
        let currentSlot = (min < 20) ? 0 : (min < 40) ? 1 : 2;
        let currentSlotKey = getCurrentSlotKey();
        let traveledCities = JSON.parse(localStorage.getItem(currentSlotKey) || '[]');

        function getCurrentSlotKey() {
            const now = new Date();
            const min = now.getMinutes();
            const slot = (min < 20) ? 0 : (min < 40) ? 1 : 2;
            const hour = now.getHours();
            const date = now.toISOString().split('T')[0];
            return 'roamedSlot_' + slot + '_' + hour + '_' + date;
        }

        // =====================
        // 2) Roaming Travel Logic
        // =====================
        async function travelToCity(cityKey, manualTrigger = false) {
            const cityId = cityToIdMap[cityKey];
            if (!cityId) {
                console.warn('Invalid cityKey:', cityKey);
                return;
            }

            const formData = new URLSearchParams({
                use_certificate: "1",
                travel_city_id: cityId.toString(),
                travel_method: "train"
            });

            console.log(`Initiating travel to ${cityKey} (ID ${cityId})...`);

            try {
                const response = await fetch("https://www.bootleggers.us/ajax/travel.php?action=drive", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "X-Requested-With": "XMLHttpRequest",
                        "Accept": "*/*",
                        "Referer": "https://www.bootleggers.us/travel.php",
                        "Origin": "https://www.bootleggers.us"
                    },
                    body: formData.toString(),
                    credentials: "include"
                });

                if (response.ok) {
                    console.log("[Roaming] Travel successful!");

                    traveledCities.push(cityKey);
                    localStorage.setItem(currentSlotKey, JSON.stringify(traveledCities));

                    setTimeout(() => {
                        if (manualTrigger) {
                            window.location.href = 'https://www.bootleggers.us/travel.php';
                        } else {
                            location.reload();
                        }
                    }, 2000);
                } else {
                    console.warn("[Roaming] Travel failed: HTTP", response.status);
                }
            } catch (error) {
                console.error("[Roaming] Travel request error:", error);
            }
        }

        setTimeout(async () => {
            if (!roamingCheckbox.checked) return;

            console.log("[Roaming] Checking if we should travel...");

            const freshSlotKey = getCurrentSlotKey();
            if (freshSlotKey !== currentSlotKey) {
                console.log("[Roaming] New timeslot detected, resetting traveled cities...");
                currentSlotKey = freshSlotKey;
                localStorage.removeItem(currentSlotKey);
                traveledCities = [];
            }

            const availableCities = Object.keys(cityCheckboxes)
                .filter(key => cityCheckboxes[key].checked && !traveledCities.includes(key));

            if (availableCities.length === 0) {
                console.log("[Roaming] No available cities for travel.");
                return;
            }

            const randomCity = availableCities[Math.floor(Math.random() * availableCities.length)];
            console.log("[Roaming] Random city chosen:", randomCity);

            // If not train ready, try to make it ready
            if (!isTrainReady()) {
                console.log("[Roaming] Train not ready, using tickets...");
                const madeReady = await trainReady();

                if (!madeReady) {
                    console.warn("[Roaming] Failed to make train ready — disabling roaming!");
                    roamingCheckbox.checked = false;
                    localStorage.setItem('roamingEnabled', 'false');
                    return;
                }
            }

            console.log("[Roaming] Train ready assumed, proceeding to travel...");
            travelToCity(randomCity, false);

        }, 10000);

        function isTrainReady() {
            const timer = $('#timer-tra .BL-timer-display').text().trim();
            return timer === "00:00:00";
        }

        async function trainReady() {
            let success = false;

            const menuButton = document.querySelector('.sideBar .cat .items-shortcut');
            if (menuButton) {
                menuButton.click();
                console.log('Character menu opened.');
            }

            const closeBtn = document.querySelector('.icon-close.main');
            if (closeBtn) {
                closeBtn.click();
                console.log('Closed character menu overlay.');
            }

            await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s

            const ticketNodes = [...document.querySelectorAll('.item.usable .BL-item.no-info[data-id="13"]')]
                .filter(el => el.hasAttribute('data-player-item-id'));
            const sortedTickets = ticketNodes.sort((a, b) => Number(a.getAttribute('data-player-item-id')) - Number(b.getAttribute('data-player-item-id')));
            const ticketIds = sortedTickets.map(el => el.getAttribute('data-player-item-id')).filter(Boolean);

            console.log(`Found ${ticketIds.length} TrainTicket(s).`);

            for (let i = 0; i < ticketIds.length; i++) {
                const itemId = ticketIds[i];

                try {
                    const response = await fetch("https://www.bootleggers.us/ajax/player.php?action=use-item", {
                        method: "POST",
                        headers: {
                            "Accept": "*/*",
                            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                            "Referer": document.location.href,
                            "X-Requested-With": "XMLHttpRequest"
                        },
                        body: new URLSearchParams({ "item_id": itemId }),
                        credentials: "include"
                    });

                    const json = await response.json();
                    console.log(`Used ticket ${i + 1}/${ticketIds.length}:`, json);

                    if (json.result && json.result.outcome === "success") {
                        console.log("✅ Ticket SUCCESS — Assume train ready now!");
                        success = true;
                        break;
                    } else {
                        console.log("❌ Ticket failed, trying next...");
                    }

                } catch (err) {
                    console.error(`Error using TrainTicket ${itemId}:`, err);
                }

                const wait = Math.random() * 2000 + 2000;
                await new Promise(resolve => setTimeout(resolve, wait));
            }

            return success;
        }

        async function checkReady() {
            if (!isTrainReady()) {
                console.log('Train not ready — Attempting to use Train Tickets immediately...');
                const madeReady = await trainReady();

                if (madeReady) {
                    console.log('Train made ready successfully — Redirecting...');
                    window.location.href = "https://www.bootleggers.us/travel.php#train";
                } else {
                    console.warn('Failed to make train ready — Not redirecting.');
                }
            } else {
                console.log('Train was already ready — Redirecting immediately.');
                window.location.href = "https://www.bootleggers.us/travel.php#train";
            }
        }

        // === Trigger train logic on .train-travel click ===
        $(document).on('click', '.train-ready', function () {
            console.log('.train-ready clicked — checking readiness and using tickets if needed...');
            checkReady();
        });

        // Auto-check train readiness every 15s if mode is enabled
        setInterval(async () => {
            if (!extraTrainCheckbox.checked) return;
            if (isTrainReady()) return;

            console.log('[Train Ready Always] Train not ready — attempting ticket use...');
            const madeReady = await trainReady();

            if (madeReady) {
                console.log('[Train Ready Always] Train now ready — refreshing...');
                location.reload(); // Refresh only
            }
        }, 8000); // every 8s

    });
});
