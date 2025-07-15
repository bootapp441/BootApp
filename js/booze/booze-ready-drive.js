document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        function getDriveTimerSeconds() {
            const timerElem = document.querySelector('#timer-dri .BL-timer-display');
            if (!timerElem) {
                console.log('[Drive] Timer element not found. Defaulting to 0 seconds.');
                return 0;
            }
            const timeString = timerElem.textContent.trim();
            const parts = timeString.split(':').map(Number);
            let totalSeconds = 0;
            if (parts.length === 3) {
                totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
            } else if (parts.length === 2) {
                totalSeconds = parts[0] * 60 + parts[1];
            }
            return totalSeconds;
        }

        async function driveReady(skipIfShortTime = false) {
            // Open the char menu to load inventory
            const menuButton = document.querySelector('.sideBar .cat .items-shortcut');
            if (menuButton) {
                menuButton.click();
                console.log('[Drive] Character menu opened.');
            }

            const closeBtn = document.querySelector('.icon-close.main');
            if (closeBtn) {
                closeBtn.click();
                console.log('[Drive] Character menu closed.');
            }

            await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s

            const lemonades = [...document.querySelectorAll('.item.usable .BL-item.no-info[data-id="100"]')]
                .filter(el => el.hasAttribute('data-player-item-id'));

            const sortedLemonades = lemonades.sort((a, b) => {
                const idA = Number(a.getAttribute('data-player-item-id'));
                const idB = Number(b.getAttribute('data-player-item-id'));
                return idA - idB;
            });

            const lemonadeIds = sortedLemonades.map(el => el.getAttribute('data-player-item-id')).filter(Boolean);

            const driveTimerSeconds = getDriveTimerSeconds();
            console.log(`[Drive] Current timer: ${driveTimerSeconds}s`);

            // No boundary, just use Lemonades until 0
            let maxLemonades = Math.ceil(driveTimerSeconds / 900);
            if (maxLemonades < 0) maxLemonades = 0;

            console.log(`[Drive] Can use up to ${maxLemonades} Lemonade(s). Found ${lemonadeIds.length}.`);

            let useCount = Math.min(maxLemonades, lemonadeIds.length);
            if (skipIfShortTime && driveTimerSeconds - useCount * 900 < 300) {
                console.log(`[Drive] Adjusting Lemonade count to avoid dropping below 300s (was ${useCount})`);
                useCount -= 1;
            }

            if (useCount === 0) {
                console.log('[Drive] No Lemonade needed or available.');
                return;
            }

            for (let i = 0; i < useCount; i++) {
                const itemId = lemonadeIds[i];
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
                    console.log(`[Drive] Used Lemonade ${i + 1}/${useCount}:`, json);

                    if (json.success !== true) {
                        console.warn('[Drive] Failed to use Lemonade item:', itemId);
                    }

                } catch (err) {
                    console.error(`[Drive] Error using Lemonade ${itemId}:`, err);
                }

                const wait = Math.random() * 500 + 500;
                console.log(`[Drive] Waiting ${wait.toFixed(0)}ms before next Lemonade...`);
                await new Promise(resolve => setTimeout(resolve, wait));
            }

            console.log('[Drive] All Lemonades consumed (if needed).');
            window.location.href = 'https://www.bootleggers.us/travel.php#drive';
        }

        function checkDriveReady(skipIfShortTime = false) {
            const driveSeconds = getDriveTimerSeconds();
            if (driveSeconds > 0) {
                console.log(`[Drive] Cooldown >0s. Attempting to use Lemonades...`);
                driveReady(skipIfShortTime);
            } else {
                console.log('[Drive] Already ready — driving now!');
                window.location.href = 'https://www.bootleggers.us/travel.php#drive';
            }
        }

        $(document).on('click', '.drive-ready', function () {
            console.log('[Drive] .drive-ready clicked — checking readiness and using Lemonades if needed...');
            checkDriveReady();
        });

        $(document).on('click', '.drive-un-ready', async function () {
            console.log('[Drive] .drive-un-ready clicked — using 1 Lemonade and refreshing...');

            const menuButton = document.querySelector('.sideBar .cat .items-shortcut');
            if (menuButton) menuButton.click();

            const closeBtn = document.querySelector('.icon-close.main');
            if (closeBtn) closeBtn.click();

            await new Promise(resolve => setTimeout(resolve, 1000));

            const lemonades = [...document.querySelectorAll('.item.usable .BL-item.no-info[data-id="100"]')]
                .filter(el => el.hasAttribute('data-player-item-id'))
                .sort((a, b) => Number(a.getAttribute('data-player-item-id')) - Number(b.getAttribute('data-player-item-id')));

            const itemId = lemonades[0]?.getAttribute('data-player-item-id');
            if (!itemId) {
                console.log('[Drive] No Lemonade available to use.');
                return;
            }

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
                console.log('[Drive] Used 1 Lemonade:', json);
            } catch (err) {
                console.error('[Drive] Error using Lemonade:', err);
            }

            // window.location.reload();
            window.location.href = 'https://www.bootleggers.us/bootlegging.php';
        });
    });
});
