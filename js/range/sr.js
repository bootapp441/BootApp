document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => { // Delay execution by 1.5 seconds
        (function () {
            const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
            let autoActive = false;
            let calibrationPoint = null;

            const canvas = document.querySelector('.target');
            const front = document.querySelector('.front');
            const container = document.querySelector('.shooting-range');

            if (!canvas || !front || !container) {
                console.error("Missing DOM elements");
                return;
            }

            // Popcorn consumption handler
            const POPCORN_ID = ["144"];
            const POPCORN_TIMER_ID = 23;

            function isTimerActive(timerId) {
                const timerElement = document.querySelector(`.player-effects .BL-effect[data-id="${timerId}"]`);
                const parentDiv = timerElement?.closest('.effect.BL-timer');
                const timeLeft = parentDiv?.querySelector('.BL-timer-display.timeleft')?.textContent.trim();
                return parentDiv?.classList.contains('BL-timer-active') && timeLeft !== "0s";
            }

            // Replace header text with checkbox and Popcorn button
            const header = document.querySelector('.BL-dialog.shooting-range h1');
            if (header) {
                header.innerHTML = `
                    <label style="margin-right: 20px;">
                        <input type="checkbox" id="activateAutoSR">
                        Activate Calibration > Click target once > Auto Shooting started
                    </label><br>
                    <label style="margin-right: 20px;">
                        <input type="checkbox" id="autoConsumePopcorn">
                        Auto Consume Popcorn
                    </label><br>
                    <button id="consumePopcornBtn" style="
                        margin-top: 4px;
                        padding: 4px 8px;
                        background-color: gold;
                        color: black;
                        font-weight: bold;
                        border: 1px solid #aaa;
                        border-radius: 5px;
                        cursor: pointer;
                    ">
                        🍿 Consume Popcorn
                    </button>
                `;

                const autoPop = localStorage.getItem("sr.autoPopcorn");
                const autoCheckboxRestored = document.getElementById("autoConsumePopcorn");
                if (autoCheckboxRestored) {
                    autoCheckboxRestored.checked = autoPop === "true";
                    console.log(`🔁 Restored auto popcorn checkbox state: ${autoPop}`);

                    autoCheckboxRestored.addEventListener('change', () => {
                        localStorage.setItem("sr.autoPopcorn", String(autoCheckboxRestored.checked));
                        console.log(`💾 Saved auto popcorn checkbox state: ${autoCheckboxRestored.checked}`);
                    });
                }
            }

            document.getElementById('consumePopcornBtn')?.addEventListener('click', async () => {
                try {
                    const menuButton = document.querySelector('.sideBar .cat .items-shortcut');
                    if (menuButton) {
                        menuButton.click();
                        console.log("📂 Character menu opened.");
                    }
                    const closeButton = document.querySelector('.icon-close.main');
                    if (closeButton) {
                        closeButton.click();
                        console.log("📁 Character menu closed.");
                    }
                    await wait(500);

                    const items = document.querySelectorAll('.items .item .BL-item.no-info');
                    const popcornItems = Array.from(items).filter(item =>
                        POPCORN_ID.includes(item.getAttribute('data-id'))
                    );

                    if (!popcornItems.length) {
                        console.log("❌ No Popcorn items found.");
                        return;
                    }

                    popcornItems.sort((a, b) => {
                        const idA = parseInt(a.getAttribute('data-player-item-id'));
                        const idB = parseInt(b.getAttribute('data-player-item-id'));
                        return idA - idB;
                    });

                    const lowestItem = popcornItems[0];
                    const playerItemId = lowestItem.getAttribute('data-player-item-id');

                    const response = await fetch("https://www.bootleggers.us/ajax/player.php?action=use-item", {
                        method: "POST",
                        headers: {
                            "Accept": "*/*",
                            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                            "Referer": window.location.href,
                            "X-Requested-With": "XMLHttpRequest"
                        },
                        body: new URLSearchParams({ "item_id": playerItemId })
                    });

                    const data = await response.json();
                    console.log(`✅ Popcorn consumed (item_id ${playerItemId}):`, data);

                    function simulateReloadOrClick() {
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

                    // Function to simulate a hyperlink click
                    function simulateHyperlinkClick() {
                        const hyperlink = document.createElement('a');
                        hyperlink.href = window.location.href; // Current page URL
                        hyperlink.click();
                    }

                    // Wait 4–8 seconds and reload
                    const delay = Math.floor(Math.random() * 2000) + 2000; // 4000–8000 ms
                    console.log(`⏳ Waiting ${(delay / 1000).toFixed(1)} seconds before reload...`);
                    setTimeout(simulateReloadOrClick, delay);

                } catch (err) {
                    console.error("🔥 Error consuming Popcorn:", err);
                }
            });

            const getBullets = () => {
                const span1 = document.querySelector('.bullets-remaining');
                const span2 = document.querySelector('.bullets-total');
                if (!span1 || !span2) return [0, 0];
                return [
                    parseInt(span1.textContent.trim(), 10),
                    parseInt(span2.textContent.trim(), 10)
                ];
            };

            const canReload = () => {
                const reloadContainer = document.querySelector('.reload-container');
                const timerDisplay = reloadContainer?.querySelector('.BL-timer-display');
                const [remaining] = getBullets();

                const timerText = timerDisplay?.textContent.trim() || '';
                const isVisible = timerDisplay?.offsetParent !== null;
                const isTimerReady = timerText === '00:00:00' || !isVisible;

                const ready = remaining === 0 && isTimerReady;

                console.log(`[RELOAD CHECK] Bullets: ${remaining}, Timer: ${timerText}, Visible: ${isVisible}, Can Reload: ${ready}`);

                return ready;
            };

            const waitUntilCanReload = async () => {
                while (true) {
                    autoActive = document.getElementById("activateAutoSR")?.checked;
                    if (!autoActive) break;

                    const [remaining] = getBullets();

                    if (remaining > 0) {
                        console.log(`🔄 Detected bullets reloaded manually (${remaining}). Aborting reload wait.`);
                        return;
                    }

                    if (canReload()) {
                        return;
                    }

                    await cycleWeaponsIfNeeded();

                    await wait(500);
                }

                if (!autoActive) {
                    console.log("❌ Reload wait aborted: auto shooting was disabled.");
                }
            };


            const clickReload = () => {
                const btn = document.querySelector('.reload-button');
                if (btn) {
                    console.log("🔄 Reloading by programmatic click...");
                    btn.click();
                    btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                } else {
                    console.warn("⚠️ Reload button not found!");
                }
            };

            const shootAt = (point) => {
                const chance = Math.random();
                let offsetX = point.x;
                let offsetY = point.y;

                if (chance < 0.2) {
                    // 20% chance: ±1 offset
                    const offset = Math.random() < 0.5 ? -1 : 1;
                    offsetX += offset;
                    offsetY += offset;
                } else if (chance < 0.3) {
                    // 10% chance: ±2 offset
                    const offset = Math.random() < 0.5 ? -2 : 2;
                    offsetX += offset;
                    offsetY += offset;
                }
                // Else 70% chance: no offset

                const down = new MouseEvent('mousedown', {
                    bubbles: true,
                    clientX: offsetX,
                    clientY: offsetY
                });
                front.dispatchEvent(down);

                setTimeout(() => {
                    const up = new MouseEvent('mouseup', {
                        bubbles: true,
                        clientX: offsetX,
                        clientY: offsetY
                    });
                    document.dispatchEvent(up);
                }, 50);
            };

            const shootAllBullets = async () => {
                let i = 0;

                while (true) {
                    autoActive = document.getElementById("activateAutoSR")?.checked;
                    if (!autoActive) break;
                    let [remaining] = getBullets();
                    if (remaining === 0) break;

                    console.log(`🎯 Shooting bullet ${i + 1} at (${calibrationPoint.x}, ${calibrationPoint.y})`);
                    shootAt(calibrationPoint);
                    i++;
                    await wait(700);
                }
            };

            const cycleWeaponsIfNeeded = async () => {
                const maxAttempts = 8;
                let attempts = 0;
                const arrow = document.querySelector(Math.random() < 0.5 ? '.arrow-right' : '.arrow-left');

                while (attempts < maxAttempts) {
                    autoActive = document.getElementById("activateAutoSR")?.checked;
                    if (!autoActive) break;
                    if (arrow) {
                        arrow.click();
                        console.log(`➡️ Cycling weapon ${attempts + 1}/${maxAttempts}...`);
                        await wait(700); // Wait for UI to update
                    }

                    const label = document.querySelector('.shooting-skill.show .progress-bar .label');
                    const isMaxed = label && label.textContent.trim() === "Maxed";
                    const [remaining] = getBullets();
                    const timerDisplay = document.querySelector('.reload-container .BL-timer-display');
                    const timerText = timerDisplay?.textContent.trim() || '';
                    const isVisible = timerDisplay?.offsetParent !== null;
                    const canReloadNow = remaining === 0 && (timerText === '00:00:00' || !isVisible);

                    console.log(`[CHECK] Bullets: ${remaining}, Timer: ${timerText}, Visible: ${isVisible}, Can Reload: ${canReloadNow}, Maxed: ${isMaxed}`);

                    if (remaining > 0 && !isMaxed) {
                        console.log("🎯 Bullets already loaded. Skipping reload and shooting directly.");
                        await shootAllBullets();
                        return;
                    }

                    if (canReloadNow && !isMaxed) {
                        console.log("✅ No bullets, but reload is ready. Reloading...");
                        clickReload();
                        await wait(800);

                        const reloadStart = Date.now();
                        while (autoActive) {
                            const [newRemaining] = getBullets();
                            if (newRemaining > 0) break;
                            if (Date.now() - reloadStart > 8000) {
                                console.warn("⏳ Reload timeout — bullets not loaded after 8s.");
                                break;
                            }
                            await wait(250);
                        }

                        console.log("💥 Starting to shoot.");
                        await shootAllBullets();
                        return;
                    }

                    attempts++;
                }

                console.log("🛑 No shootable weapon found after cycling.");

                // Try cycling 8 more times but stop early if a non-maxed weapon is found
                console.log("🔁 Cycling 8 more times to find a non-maxed weapon...");
                let extraAttempts = 0;
                while (extraAttempts < 8) {
                    autoActive = document.getElementById("activateAutoSR")?.checked;
                    if (!autoActive) break;
                    if (arrow) {
                        arrow.click();
                        console.log(`🔄 Extra cycle ${extraAttempts + 1}/8...`);
                        await wait(700); // Let UI update
                    }

                    const label = document.querySelector('.shooting-skill.show .progress-bar .label');
                    const isMaxed = label && label.textContent.trim() === "Maxed";

                    if (!isMaxed) {
                        console.log("🟢 Found a non-maxed weapon. Ending extra cycles early.");
                        break;
                    }

                    extraAttempts++;
                }

                // 🍿 Trigger auto popcorn consumption if applicable
                if (document.getElementById("autoConsumePopcorn")?.checked && !isTimerActive(POPCORN_TIMER_ID)) {
                    const consumeBtn = document.getElementById("consumePopcornBtn");
                    if (consumeBtn) {
                        console.log("🍿 Triggering popcorn consumption at end of full cycle...");
                        consumeBtn.click();
                    }
                }

                // Wait up to 2–4 minutes, but poll every 5s for an early opportunity
                const minutes = Math.floor(Math.random() * 2) + 2;
                const msTotal = minutes * 60 * 1000;
                const waitInterval = 5000;
                let waited = 0;

                console.log(`🕒 Monitoring for reloadable weapon up to ${minutes} minute(s)...`);

                while (waited < msTotal) {
                    autoActive = document.getElementById("activateAutoSR")?.checked;
                    if (!autoActive) break;
                    const label = document.querySelector('.shooting-skill.show .progress-bar .label');
                    const isMaxed = label && label.textContent.trim() === "Maxed";
                    const [remaining] = getBullets();
                    const timerDisplay = document.querySelector('.reload-container .BL-timer-display');
                    const timerText = timerDisplay?.textContent.trim() || '';
                    const isVisible = timerDisplay?.offsetParent !== null;
                    const canReloadNow = remaining === 0 && (timerText === '00:00:00' || !isVisible);

                    console.log(`[MONITOR] Bullets: ${remaining}, Timer: ${timerText}, Visible: ${isVisible}, Can Reload: ${canReloadNow}, Maxed: ${isMaxed}`);

                    if (remaining > 0 && !isMaxed) {
                        console.log("🎯 Bullets already loaded. Skipping reload and shooting directly.");
                        await shootAllBullets();
                        return;
                    }

                    if (canReloadNow && !isMaxed) {
                        console.log("🚨 Weapon became shootable during wait! Breaking early.");
                        clickReload();
                        await wait(800);

                        const reloadStart = Date.now();
                        while (autoActive) {
                            const [newRemaining] = getBullets();
                            if (newRemaining > 0) break;
                            if (Date.now() - reloadStart > 8000) {
                                console.warn("⏳ Reload timeout — bullets not loaded after 8s.");
                                break;
                            }
                            await wait(250);
                        }

                        console.log("💥 Shooting after early wakeup.");
                        await shootAllBullets();
                        return;
                    }

                    await wait(waitInterval);
                    waited += waitInterval;
                }
            };

            async function startLoop() {
                console.log("🔁 Starting or resuming auto shooting loop...");
                while (true) {
                    autoActive = document.getElementById("activateAutoSR")?.checked;
                    if (!autoActive) break;

                    const [remaining] = getBullets();

                    if (remaining > 0) {
                        console.log(`💥 Resuming with ${remaining} bullets loaded.`);
                        await shootAllBullets();
                    }

                    if (!autoActive) break;

                    console.log("⏳ Waiting for reload...");
                    await waitUntilCanReload();
                    if (!autoActive) break;

                    if (canReload()) {
                        clickReload();
                        await wait(500);
                    } else {
                        await cycleWeaponsIfNeeded();
                        continue; // Restart loop after cycling
                    }
                }
                console.log("🚫 Loop exited. Waiting for reactivation...");
            }

            document.getElementById('activateAutoSR').addEventListener('change', function () {
                autoActive = this.checked;
                localStorage.setItem("sr.autoEnabled", String(autoActive));

                if (!autoActive) {
                    console.log("🛑 Auto Shooting paused.");
                    localStorage.removeItem("sr.calibration"); // 🧹 Clear calibration
                    calibrationPoint = null;
                    console.log("🧼 Calibration cleared.");
                    return;
                }

                if (calibrationPoint) {
                    console.log("▶️ Resuming auto shooting...");
                    startLoop();
                    return;
                }

                console.log("🛠 Ready. Click target once to calibrate.");
                const handler = (e) => {
                    calibrationPoint = { x: e.clientX, y: e.clientY };
                    console.log("📌 Calibrated at:", calibrationPoint);

                    // Save to localStorage
                    localStorage.setItem("sr.calibration", JSON.stringify(calibrationPoint));

                    front.removeEventListener('click', handler);
                    front.style.pointerEvents = 'none';

                    setTimeout(async () => {
                        const [remaining, total] = getBullets();
                        console.log(`🔎 Bullets after calibration: ${remaining}/${total}`);

                        if (remaining > 0) {
                            console.log(`💥 Using up ${remaining} bullets.`);
                            await shootAllBullets();
                            console.log("⏳ Waiting for reload...");
                            await waitUntilCanReload();

                            if (!autoActive) return;

                            // Only reload if we still meet the conditions
                            if (canReload()) {
                                clickReload();
                                await wait(500);
                            }
                            startLoop();
                        } else {
                            console.log(`📭 No bullets loaded. Waiting for reload...`);
                            console.log("⏳ Waiting until reload becomes available...");
                            await waitUntilCanReload();

                            if (!autoActive) return;

                            // Only reload if we still meet the conditions
                            if (canReload()) {
                                clickReload();
                                await wait(500);
                            }
                            startLoop();
                        }
                    }, 500);
                };
                front.addEventListener('click', handler);
            });

            // Restore calibration and auto state after 2–4 seconds
            // const restoreDelay = Math.floor(Math.random() * 2000) + 2000;
            // setTimeout(() => {
            //     const storedCalibration = localStorage.getItem("sr.calibration");
            //     const storedAuto = localStorage.getItem("sr.autoEnabled");
            // 
            //     if (storedCalibration) {
            //         try {
            //             calibrationPoint = JSON.parse(storedCalibration);
            //             console.log("📌 Restored calibration:", calibrationPoint);
            //         } catch (e) {
            //             console.warn("⚠️ Failed to parse stored calibration:", e);
            //         }
            //     }
            // 
            //     if (storedAuto === "true") {
            //         const checkbox = document.getElementById("activateAutoSR");
            //         if (checkbox) checkbox.checked = true;
            //         autoActive = true;
            //         console.log("✅ Auto Shooting enabled from previous state.");
            //         if (calibrationPoint) {
            //             console.log("▶️ Auto Shooting resuming with stored calibration...");
            //             startLoop();
            //         } else {
            //             console.log("🟡 Awaiting calibration click...");
            //         }
            //     }
            // }, restoreDelay);
        })();
    });
});
