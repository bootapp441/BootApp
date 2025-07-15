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
            for (const key in cityToIdMap) {
                if (localStorage.getItem(`oc.leader.city.${key}`) === 'true') {
                    return key;
                }
            }
            return null;
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
                console.warn(`[OC-L-Travel] Invalid city key "${cityKey}" — skipping travel.`);
                return;
            }

            const formData = new URLSearchParams({
                use_certificate: "1",
                travel_city_id: cityId.toString(),
                travel_method: "train"
            });

            console.log(`[OC-L-Travel] Initiating travel to ${cityKey} (ID ${cityId})...`);

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
                    console.log("[OC-L-Travel] Travel successful. Redirecting in 2s...");
                    setTimeout(() => {
                        window.location.href = 'https://www.bootleggers.us/orgcrime.php';
                    }, 2000);
                } else {
                    console.warn("[OC-L-Travel] Travel failed: HTTP", response.status);
                }
            } catch (error) {
                console.error("[OC-L-Travel] Travel request error:", error);
            }
        }

        async function useTrainTicketsAndRetryTravel() {
            const menuButton = document.querySelector('.sideBar .cat .items-shortcut');
            if (menuButton) {
                menuButton.click();
                console.log('[OC-L-Travel] Character menu opened.');
            }

            const closeBtn = document.querySelector('.icon-close.main');
            if (closeBtn) {
                closeBtn.click();
                console.log('[OC-L-Travel] Closed character menu overlay.');
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
            console.log(`[OC-L-Travel] Found ${ticketIds.length} TrainTicket(s).`);

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
                    console.log(`[OC-L-Travel] Used ticket ${i + 1}/${ticketIds.length}:`, json);

                    if (json.success === true && !json.error) {
                        console.log("[OC-L-Travel] ✅ Ticket succeeded — attempting travel...");
                        const targetCity = getTargetCityKeyFromConfig();
                        if (targetCity) {
                            setTimeout(() => {
                                travelToCity(targetCity);
                            }, 1000);
                        } else {
                            console.warn("[OC-L-Travel] No target city found after using ticket — cannot travel.");
                        }
                        return;
                    } else {
                        console.log("[OC-L-Travel] ❌ Ticket failed, continuing...");
                    }

                } catch (err) {
                    console.error(`[OC-L-Travel] Error using TrainTicket ${itemId}:`, err);
                }

                const wait = Math.random() * 2000 + 2000; // 2–4s
                console.log(`[OC-L-Travel] Waiting ${wait.toFixed(0)}ms before next ticket...`);
                await new Promise(resolve => setTimeout(resolve, wait));
            }

            console.log('[OC-L-Travel] All tickets tried without success. Refreshing page...');
            setTimeout(() => window.location.href = "/orgcrime.php", 1000);
        }

        function checkAndTravel() {
            if (localStorage.getItem('oc.leader.mode') !== 'true' || localStorage.getItem('oc.leader.autoTravel') !== 'true') {
                console.log('[OC-L-Travel] Leader mode OFF — skipping travel.');
                return;
            }

            const currentCity = getCurrentCityKey();
            const targetCity = getTargetCityKeyFromConfig();

            if (!targetCity) {
                console.log("[OC-L-Travel] No target city enabled in config — skipping travel.");
                return;
            }

            if (currentCity === targetCity) {
                console.log("[OC-L-Travel] Already in the correct city — no travel needed.");
                return;
            }

            if (!isOCTimerReady()) {
                console.log("[OC-L-Travel] OC timer not ready — skipping travel.");
                return;
            }

            if (!isTrainReady()) {
                const startTime = parseInt($('#timer-tra').attr('data-start-time'), 10) || 0;
                const length = parseInt($('#timer-tra').attr('data-length'), 10) || 0;
                const remaining = (startTime + length) - Math.floor(Date.now() / 1000);
                console.log(`[OC-L-Travel] Train not ready — ${remaining}s remaining.`);

                if (remaining > 600) {
                    console.log("[OC-L-Travel] Train cooldown >10 min. Attempting to use Train Tickets...");
                    useTrainTicketsAndRetryTravel();
                }

                return;
            }

            travelToCity(targetCity);
        }

        // === Initial check after 2–5 seconds ===
        const initialDelay = Math.floor(Math.random() * 3000) + 2000;
        console.log(`[OC-L-Travel] Waiting ${initialDelay}ms before first travel check...`);
        setTimeout(checkAndTravel, initialDelay);

        // === Periodic train check every 30 seconds ===
        setInterval(() => {
            console.log("[OC-L-Travel] Checking train readiness and travel eligibility...");
            checkAndTravel();
        }, 30000); // 30 seconds
    });
});
