document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(async function () {
        const autoEquip = localStorage.getItem('oc.participant.autoEquip') === 'true';
        const autoReady = localStorage.getItem('oc.participant.autoReady') === 'true';
        if (!autoEquip) {
            console.log('[OC-ReadyUp] autoEquip disabled — exiting.');
            return;
        }

        const username = $('.username').text().trim();

        console.log(`[OC-ReadyUp] Starting routine for ${username}...`);

        const car1Table = [...document.querySelectorAll('.oc-table .header')]
            .find(h => h.textContent.trim() === 'Car 1')?.closest('table');
        if (!car1Table) return console.warn('[OC-ReadyUp] Car 1 not found.');

        const memberTables = car1Table.querySelectorAll('table.sub3');
        let playerRole = null;
        let playerCell = null;

        for (const table of memberTables) {
            const name = table.querySelector('a[href^="/user/"]')?.textContent.trim();
            if (name === username) {
                const roleCell = table.closest('td').querySelector('.member-info');
                const roleText = roleCell?.querySelector('b')?.textContent.trim();
                if (roleText) {
                    playerRole = roleText;
                    playerCell = roleCell;
                }
                break;
            }
        }

        if (!playerRole || !playerCell) {
            console.warn('[OC-ReadyUp] Could not find your role or cell.');
            return;
        }

        console.log(`[OC-ReadyUp] Detected role: ${playerRole}`);

        // === Weapons Expert Logic ===
        if (playerRole === 'Weapons expert') {
            console.log('[OC-ReadyUp] Preparing weapon: BAR M1918');

            const menuButton = document.querySelector('.sideBar .cat .items-shortcut');
            if (menuButton) {
                menuButton.click();
                console.log('[OC-ReadyUp] Character menu opened.');
                await new Promise(resolve => setTimeout(resolve, 600));
            }

            const allBars = [...document.querySelectorAll('.item.equippable .BL-item.no-info[data-id="67"]')];
            const barItems = allBars.map(el => ({
                id: el.getAttribute('data-player-item-id'),
                isEquipped: el.closest('.item')?.classList.contains('equipped')
            })).filter(bar => bar.id);

            if (!barItems.length) {
                console.warn('[OC-ReadyUp] No BAR M1918 in inventory.');
            } else {
                const alreadyEquipped = barItems.some(bar => bar.isEquipped);
                const lowestId = barItems.reduce((min, bar) => bar.id < min ? bar.id : min, barItems[0].id);

                if (!alreadyEquipped) {
                    try {
                        const response = await fetch("https://www.bootleggers.us/ajax/player.php?action=use-item", {
                            method: "POST",
                            headers: {
                                "Accept": "*/*",
                                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                                "Referer": window.location.href,
                                "X-Requested-With": "XMLHttpRequest"
                            },
                            body: new URLSearchParams({ item_id: lowestId }),
                            credentials: "include"
                        });

                        const json = await response.json();
                        console.log('[OC-ReadyUp] Equip response:', json);
                    } catch (err) {
                        console.error('[OC-ReadyUp] Equip request failed:', err);
                        return;
                    }
                } else {
                    console.log('[OC-ReadyUp] BAR M1918 already equipped.');
                }
            }

            const closeBtn = document.querySelector('.icon-close.main');
            if (closeBtn) {
                closeBtn.click();
                console.log('[OC-ReadyUp] Character menu closed.');
            }

            setTimeout(() => {
                const chopperOption = [...document.querySelectorAll('ul.equipment-list.weapons li')]
                    .find(li => li.querySelector('.name')?.textContent.trim() === 'Chopper Squad');

                if (chopperOption) {
                    const radio = chopperOption.querySelector('input[type="radio"]');
                    if (radio) {
                        radio.checked = true;
                        console.log('[OC-ReadyUp] Selected: Chopper Squad');
                    }
                } else {
                    console.warn('[OC-ReadyUp] Could not find Chopper Squad option.');
                }

                const buyBtn = document.querySelector('input[type="submit"][value="Buy!"]');
                if (buyBtn) {
                    console.log('[OC-ReadyUp] Clicking Buy!');
                    buyBtn.click();
                    return;
                }

                if (autoReady) {
                    const readyBtn = document.querySelector('input[type="submit"][name="readyup"][value="Ready!"]');
                    if (readyBtn) readyBtn.click();
                }
            }, 1000);

            return;
        }

        // === Explosives Expert Logic ===
        if (playerRole === 'Explosives expert') {
            const invRow = [...playerCell.querySelectorAll('tr')]
                .find(row => row.textContent.includes('Inventory:'));
            const inventoryText = invRow?.lastElementChild?.textContent.trim() || '';
            const hasInventory = /(Dynamite|Forged Bank Keys)/i.test(inventoryText);

            if (hasInventory) {
                console.log(`[OC-ReadyUp] Already equipped with ${inventoryText}.`);
                if (autoReady) {
                    const readyBtn = document.querySelector('input[type="submit"][name="readyup"][value="Ready!"]');
                    if (readyBtn) readyBtn.click();
                }
                return;
            }

            const explosivesList = document.querySelectorAll('ul.equipment-list.explosives li');
            let itemToSelect = null;

            for (const item of explosivesList) {
                const name = item.querySelector('.name')?.textContent.trim();
                if (name === 'Forged Bank Keys') {
                    itemToSelect = item;
                    break;
                }
                if (name === 'Dynamite' && !itemToSelect) itemToSelect = item;
            }

            if (!itemToSelect) return console.warn('[OC-ReadyUp] No suitable explosive item found.');

            const radio = itemToSelect.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                console.log(`[OC-ReadyUp] Selected ${itemToSelect.querySelector('.name')?.textContent.trim()}`);
            }

            setTimeout(() => {
                const buyBtn = document.querySelector('input[type="submit"][value="Buy!"]');
                if (buyBtn) return buyBtn.click();

                if (autoReady) {
                    const readyBtn = document.querySelector('input[type="submit"][name="readyup"][value="Ready!"]');
                    if (readyBtn) readyBtn.click();
                }
            }, 800);

            return;
        }

        // === Driver Logic ===
        if (playerRole === 'Driver') {
            console.log('[OC-ReadyUp] Driver — checking assigned inventory...');

            const invRow = [...playerCell.querySelectorAll('tr')]
                .find(row => row.textContent.includes('Inventory:'));
            const inventoryText = invRow?.lastElementChild?.textContent.trim() || '';

            if (inventoryText.includes('99%') && inventoryText.includes('0% dmg')) {
                console.log(`[OC-ReadyUp] Car already assigned with 99% success and 0% damage: "${inventoryText}" — skipping.`);
                setTimeout(() => {
                    if (autoReady) {
                        const readyBtn = document.querySelector('input[type="submit"][name="readyup"][value="Ready!"]');
                        if (readyBtn) readyBtn.click();
                    }
                }, 800);
                return;
            }

            console.log('[OC-ReadyUp] No ideal car assigned — selecting 99% car from dropdown...');

            const carSelect = document.querySelector('select[name="player_car_id"]');
            if (!carSelect) {
                console.warn('[OC-ReadyUp] Car dropdown not found.');
                return;
            }

            const options = [...carSelect.querySelectorAll('option')];
            const bestOption = options.find(opt =>
                opt.dataset.success === "99%" || opt.textContent.includes("99%")
            );

            if (bestOption) {
                carSelect.value = bestOption.value;
                carSelect.dispatchEvent(new Event('change'));
                console.log(`[OC-ReadyUp] Selected 99% car: ${bestOption.textContent.trim()}`);

                const useBtn = document.querySelector('input[type="submit"][value="Use!"]');
                if (useBtn) {
                    console.log('[OC-ReadyUp] Clicking Use! to assign car...');
                    useBtn.click();
                    setTimeout(() => {
                        if (autoReady) {
                            const readyBtn = document.querySelector('input[type="submit"][name="readyup"][value="Ready!"]');
                            if (readyBtn) readyBtn.click();
                        }
                    }, 800);
                    return;
                } else {
                    console.warn('[OC-ReadyUp] Use! button not found.');
                }
            } else {
                console.warn('[OC-ReadyUp] No 99% car found in dropdown.');
            }

            // === Fallback: Repair/un-hot logic if no car is usable ===
            console.log('[OC-ReadyUp] No usable car assigned — trying to repair or un-hot cars...');

            const menuButton = document.querySelector('.sideBar .cat .items-shortcut');
            if (menuButton) {
                menuButton.click();
                console.log('[OC-ReadyUp] Opened character menu.');
                await new Promise(resolve => setTimeout(resolve, 600));
            }

            const carsTab = document.querySelector('button[data-panel="cars"]');
            if (carsTab) {
                carsTab.click();
                console.log('[OC-ReadyUp] Opened Cars panel.');
                await new Promise(resolve => setTimeout(resolve, 600));
            }

            const hasHotCars = document.querySelectorAll('.car-plate.is-hot').length > 0;
            if (hasHotCars) {
                document.querySelectorAll('.select-hot-cars').forEach(btn => btn.click());
                console.log('[OC-ReadyUp] Selected hot cars.');
                await new Promise(resolve => setTimeout(resolve, 3000));
            }

            document.querySelectorAll('.select-repair').forEach(el => el.click());
            console.log('[OC-ReadyUp] Repaired all cars.');
            await new Promise(resolve => setTimeout(resolve, 2000));

            const closeBtn = document.querySelector('.icon-close.main');
            if (closeBtn) {
                closeBtn.click();
                console.log('[OC-ReadyUp] Closed character menu.');
            }

            console.log('[OC-ReadyUp] Refresh to re-check for usable cars...');
            window.location.href = '/orgcrime.php';
        }

    });
});
