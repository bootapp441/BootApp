document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {

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

        function getCurrentCityKey() {
            const currentCityName = $('.player-location .city-name').text().trim();
            return cityNameToKeyMap[currentCityName] || null;
        }

        function getTargetCityKeyFromConfig() {
            return getOCCityKeyFromInviteTable();
        }

        function getOCCityKeyFromInviteTable() {
            const tables = document.querySelectorAll('.insideTables .sub2.centered');
            let inviteTable = null;

            for (const table of tables) {
                const headerCell = table.querySelector('tr td.header');
                if (headerCell && headerCell.textContent.trim() === 'Invitations') {
                    inviteTable = table;
                    break;
                }
            }

            if (!inviteTable) {
                console.warn("[OC-P-Travel-Join] Could not find the OC Invitations table.");
                return null;
            }

            const inviteRow = inviteTable.querySelector('tr input[type="radio"][name="invite"]')?.closest('tr');
            if (!inviteRow) {
                console.warn("[OC-P-Travel-Join] No OC invite row found.");
                return null;
            }

            const cells = inviteRow.querySelectorAll('td');
            if (cells.length < 5) {
                console.warn("[OC-P-Travel-Join] OC invite row doesn't have enough columns.");
                return null;
            }

            const cityName = cells[4].textContent.trim();
            const cityKey = cityNameToKeyMap[cityName];

            if (!cityKey) {
                console.warn(`[OC-P-Travel-Join] Unrecognized OC city name: ${cityName}`);
                return null;
            }

            console.log(`[OC-P-Travel-Join] Detected OC invite city: ${cityName} (${cityKey})`);
            return cityKey;
        }

        function isTrainReady() {
            const timer = $('#timer-tra .BL-timer-display').text().trim();
            return timer === "00:00:00";
        }

        function isOCTimerReady() {
            const timer = $('#timer-org .BL-timer-display').text().trim();
            return timer === "00:00:00";
        }

        async function travelToCity(cityKey) {
            const cityId = cityToIdMap[cityKey];
            if (!cityId) {
                console.warn(`[OC-P-Travel-Join] Invalid city key "${cityKey}" — skipping travel.`);
                return;
            }

            const formData = new URLSearchParams({
                use_certificate: "1",
                travel_city_id: cityId.toString(),
                travel_method: "train"
            });

            console.log(`[OC-P-Travel-Join] Initiating travel to ${cityKey} (ID ${cityId})...`);

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
                    console.log("[OC-P-Travel-Join] Travel successful. Redirecting in 2s...");
                    setTimeout(() => {
                        window.location.href = 'https://www.bootleggers.us/orgcrime.php';
                    }, 2000);
                } else {
                    console.warn("[OC-P-Travel-Join] Travel failed: HTTP", response.status);
                }
            } catch (error) {
                console.error("[OC-P-Travel-Join] Travel request error:", error);
            }
        }

        async function useTrainTicketsAndRetryTravel() {
            const menuButton = document.querySelector('.sideBar .cat .items-shortcut');
            if (menuButton) {
                menuButton.click();
                console.log('[OC-P-Travel-Join] Character menu opened.');
            }

            const closeBtn = document.querySelector('.icon-close.main');
            if (closeBtn) {
                closeBtn.click();
                console.log('[OC-P-Travel-Join] Closed character menu overlay.');
            }

            await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s for items to load

            const ticketNodes = [...document.querySelectorAll('.item.usable .BL-item.no-info[data-id="13"]')]
                .filter(el => el.hasAttribute('data-player-item-id'));

            const sortedTickets = ticketNodes.sort((a, b) => {
                const idA = Number(a.getAttribute('data-player-item-id'));
                const idB = Number(b.getAttribute('data-player-item-id'));
                return idA - idB;
            });

            const ticketIds = sortedTickets.map(el => el.getAttribute('data-player-item-id')).filter(Boolean);
            console.log(`[OC-P-Travel-Join] Found ${ticketIds.length} TrainTicket(s).`);

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
                    console.log(`[OC-P-Travel-Join] Used ticket ${i + 1}/${ticketIds.length}:`, json);

                    if (json.success === true && !json.error) {
                        console.log("[OC-P-Travel-Join] ✅ Ticket succeeded — attempting travel...");
                        const targetCity = getTargetCityKeyFromConfig();
                        if (targetCity) {
                            setTimeout(() => {
                                travelToCity(targetCity);
                            }, 1000);
                        } else {
                            console.warn("[OC-P-Travel-Join] No target city found after using ticket — cannot travel.");
                        }
                        return;
                    } else {
                        console.log("[OC-P-Travel-Join] ❌ Ticket failed, continuing...");
                    }

                } catch (err) {
                    console.error(`[OC-P-Travel-Join] Error using TrainTicket ${itemId}:`, err);
                }

                const wait = Math.random() * 2000 + 2000; // 2–4s
                console.log(`[OC-P-Travel-Join] Waiting ${wait.toFixed(0)}ms before next ticket...`);
                await new Promise(resolve => setTimeout(resolve, wait));
            }

            console.log('[OC-P-Travel-Join] All tickets tried without success. Refreshing page...');
            setTimeout(() => window.location.href = "/orgcrime.php", 1000);
        }

        function checkAndTravel() {
            if (localStorage.getItem('oc.participant.mode') !== 'true') {
                console.log('[OC-P-Travel-Join] Participant mode OFF — skipping travel.');
                return;
            }

            const currentCity = getCurrentCityKey();
            const targetCity = getOCCityKeyFromInviteTable();

            if (!targetCity) {
                console.log("[OC-P-Travel-Join] No OC invite city found — skipping.");
                return;
            }

            if (!isOCTimerReady()) {
                console.log("[OC-P-Travel-Join] OC timer not ready — skipping.");
                return;
            }

            if (currentCity !== targetCity) {
                if (localStorage.getItem('oc.participant.autoTravel') !== 'true') {
                    console.warn('[OC-P-Travel-Join] Not in OC city and auto travel disabled — cannot proceed.');
                    return;
                }

                if (!isTrainReady()) {
                    const startTime = parseInt($('#timer-tra').attr('data-start-time'), 10) || 0;
                    const length = parseInt($('#timer-tra').attr('data-length'), 10) || 0;
                    const remaining = (startTime + length) - Math.floor(Date.now() / 1000);
                    console.log(`[OC-P-Travel-Join] Train not ready — ${remaining}s remaining.`);

                    if (remaining > 600) {
                        console.log("[OC-P-Travel-Join] Train cooldown >10 min. Attempting to use Train Tickets...");
                        useTrainTicketsAndRetryTravel();
                    }

                    return;
                }

                travelToCity(targetCity);
                return;
            }

            const tables = document.querySelectorAll('.insideTables .sub2.centered');
            let inviteTable = null;

            for (const table of tables) {
                const headerCell = table.querySelector('tr td.header');
                if (headerCell && headerCell.textContent.trim() === 'Invitations') {
                    inviteTable = table;
                    break;
                }
            }

            if (!inviteTable) {
                console.warn('[OC-P-Travel-Join] Could not find OC Invitations table.');
                return;
            }

            const radioRow = inviteTable.querySelector('tr input[type="radio"][name="invite"]')?.closest('tr');
            const radio = radioRow?.querySelector('input[type="radio"][name="invite"]');
            const form = inviteTable.closest('form');

            if (radio && form) {
                radio.checked = true;
                console.log('[OC-P-Travel-Join] Radio invite selected. Clicking Accept button in 1s...');

                const acceptButton = form.querySelector('input[type="submit"][name="go-accept"]');

                if (acceptButton) {
                    setTimeout(() => {
                        acceptButton.click();
                    }, 1000);
                } else {
                    console.warn('[OC-P-Travel-Join] Accept button not found in form.');
                }
            } else {
                console.warn('[OC-P-Travel-Join] Could not find OC invite radio or form.');
            }
        }

        // === Initial check after 2–5 seconds ===
        const initialDelay = Math.floor(Math.random() * 3000) + 2000;
        console.log(`[OC-P-Travel-Join] Waiting ${initialDelay}ms before first travel check...`);
        setTimeout(checkAndTravel, initialDelay);

        // === Periodic train check every 30 seconds ===
        setInterval(() => {
            console.log("[OC-P-Travel-Join] Checking train readiness and travel eligibility...");
            checkAndTravel();
        }, 30000); // 30 seconds

    });
});