document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        // ----------------------------------------------------------
        // 0) Function to SORT items by data-id, then data-player-item-id
        // ----------------------------------------------------------
        async function sortAllItems() {
            const allItems = Array.from(document.querySelectorAll('.items .BL-item'));
            if (allItems.length === 0) {
                console.log("No items found to sort.");
                return;
            }

            // Define sort priorities
            const priorityStart = [
                163, 129, 110, 147, 92, 91,
                154, 62, 63, 64, 65, 66, 67, 68,
                12, 36, 19, 1, 116,
                69, 70, 71, 72, 73,
                95, 137
            ];

            const priorityEnd = [
                4, 136, 100, 37, 13, 142, 144, 53
            ];

            // Custom sort function
            function getSortWeight(item) {
                const dataId = parseInt(item.getAttribute('data-id'), 10);
                const startIndex = priorityStart.indexOf(dataId);
                const endIndex = priorityEnd.indexOf(dataId);

                if (startIndex !== -1) return startIndex - 1000;     // Front of list
                if (endIndex !== -1) return endIndex + 10000;        // End of list

                return dataId + 1000; // Everything else in between
            }

            // Sort the items
            allItems.sort((a, b) => {
                const weightA = getSortWeight(a);
                const weightB = getSortWeight(b);

                if (weightA === weightB) {
                    const playerItemIdA = parseInt(a.getAttribute('data-player-item-id'), 10);
                    const playerItemIdB = parseInt(b.getAttribute('data-player-item-id'), 10);
                    return playerItemIdA - playerItemIdB;
                }

                return weightA - weightB;
            });

            // Send sorted IDs
            const sortedIds = allItems.map(e => e.getAttribute('data-player-item-id'));
            const sortString = sortedIds.join(',');

            try {
                console.log("Sending sort request with the following item order:", sortString);

                const response = await fetch("https://www.bootleggers.us/ajax/player.php?action=sort-items", {
                    method: "POST",
                    headers: {
                        "Accept": "*/*",
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "Referer": window.location.href,
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    body: new URLSearchParams({ sort: sortString })
                });

                const data = await response.json();
                console.log("Response from sort-items:", data);
            } catch (err) {
                console.error("Error sorting items:", err);
            }

            // Random delay between 4.5 and 6.7 seconds
            const delay = Math.random() * (6.7 - 4.5) + 4.5;
            console.log(`Waiting for ${delay.toFixed(2)} seconds before using the next item.`);
            await new Promise(resolve => setTimeout(resolve, delay * 1000));
        }

        // ----------------------------------------------------------
        // 1) Function to USE items (example: data-id="4")
        // ----------------------------------------------------------
        async function processItems(itemIds) {
            console.log(`Starting to use ${itemIds.length} items (data-id="4").`);

            for (let i = 0; i < itemIds.length; i++) {
                const itemId = itemIds[i];
                console.log(`Using item ${i + 1} of ${itemIds.length}, item_id: ${itemId}`);

                try {
                    const response = await fetch("https://www.bootleggers.us/ajax/player.php?action=use-item", {
                        method: "POST",
                        headers: {
                            "Accept": "*/*",
                            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                            "Referer": window.location.href,
                            "X-Requested-With": "XMLHttpRequest"
                        },
                        body: new URLSearchParams({
                            "item_id": itemId
                        })
                    });
                    const data = await response.json();
                    console.log(`Response for item_id ${itemId}:`, data);
                } catch (error) {
                    console.error(`Error using item_id ${itemId}:`, error);
                }

                // Random delay between 4.5 and 6.7 seconds
                const delay = Math.random() * (6.7 - 4.5) + 4.5;
                console.log(`Waiting for ${delay.toFixed(2)} seconds before using the next item.`);
                await new Promise(resolve => setTimeout(resolve, delay * 1000));

                // Additional delay every 4 to 10 items
                if ((i + 1) % (Math.floor(Math.random() * (10 - 4 + 1)) + 4) === 0) {
                    const extraDelay = Math.random() * (12 - 7) + 7;
                    console.log(`Additional delay of ${extraDelay.toFixed(2)} seconds after using ${i + 1} items.`);
                    await new Promise(resolve => setTimeout(resolve, extraDelay * 1000));
                }
            }

            console.log("All items (data-id=4) used.");
        }

        // ----------------------------------------------------------
        // 2) Function to DROP items
        // ----------------------------------------------------------
        async function processDropItems(itemIds) {
            const drop = async ids => {
                const body = new URLSearchParams();
                ids.forEach(id => body.append("player_item_ids[]", id));
                const res = await fetch("https://www.bootleggers.us/ajax/player.php?action=drop-item", {
                    method: "POST",
                    headers: {
                        "Accept": "*/*",
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "Referer": window.location.href,
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    body
                });
                return res.json();
            };

            const wait = async () => await new Promise(r => setTimeout(r, (Math.random() * 2.2 + 4.5) * 1000));

            try {
                const data = await drop(itemIds);
                if (data?.message === "Invalid item!") throw new Error("Fallback");
            } catch {
                for (let id of itemIds) {
                    try {
                        const res = await drop([id]);
                        if (res?.message !== "Invalid item!") console.log(`Dropped ${id}`);
                    } catch { }
                    await wait();
                }
            }
            await wait();
        }

        // ----------------------------------------------------------
        // 3) Main Click Handler (Open + Clean)
        // ----------------------------------------------------------
        $(document).on('click', '.open-clean-collection', async function () {
            console.log("Open clean button clicked.");

            // STEP 0: Conditionally sort items
            const SORT_ENABLED = localStorage.getItem('houseKeepingSortEnabled') !== 'false';
            if (SORT_ENABLED) {
                await sortAllItems();
            } else {
                console.log("Sort is disabled via localStorage (houseKeepingSortEnabled). Skipping sort.");
            }

            // STEP A: Use items with data-id="4"
            const OPEN_LOOTBOX = localStorage.getItem('houseKeepingLootbox') !== 'false'; // default true

            if (OPEN_LOOTBOX) {
                const useItems = document.querySelectorAll('.items .BL-item[data-id="4"]');
                const useItemIds = Array.from(useItems).map(item => item.getAttribute('data-player-item-id'));

                console.log(`Found ${useItemIds.length} items with data-id="4".`, useItemIds);

                // Process "use" items with randomized delays
                if (useItemIds.length > 0) {
                    await processItems(useItemIds);
                } else {
                    console.log("No items found to use (data-id=4).");
                }
            } else {
                console.log("Lootbox housekeeping disabled via localStorage.");
            }

            // STEP B: Prepare to drop items

            // --- Guns Handling
            const REMOVE_GUNS = localStorage.getItem('houseKeepingGuns') !== 'false';
            if (REMOVE_GUNS) {
                function getDropIdsForGun(dataId) {
                    let elements = Array.from(document.querySelectorAll(`.items .BL-item[data-id="${dataId}"]`));
                    const equipped = elements.find(elem => elem.closest('.item.equipped') !== null);

                    if (elements.length > 0) {
                        if (equipped) {
                            elements = elements.filter(e => e !== equipped);
                        } else {
                            elements.sort((a, b) =>
                                parseInt(a.getAttribute('data-player-item-id'), 10) -
                                parseInt(b.getAttribute('data-player-item-id'), 10)
                            );
                            elements.shift(); // keep one with lowest ID
                        }
                    }

                    return elements.map(e => e.getAttribute('data-player-item-id'));
                }

                // --- B.1) Thompson Handling (data-id=66)
                thompsonDropIds = getDropIdsForGun(66);
                batDropIds = getDropIdsForGun(116);
                derringerDropIds = getDropIdsForGun(154);
                swSpecialDropIds = getDropIdsForGun(62);
                coltM1903DropIds = getDropIdsForGun(63);

            } else {
                console.log("Guns housekeeping disabled via localStorage.");
            }

            // --- B.3) Cola, shiv and cigar Handling (data-id=31,21,142)
            function getDropIdsKeepTopN(dataId, label, keepKey = 'houseKeepingColaKeep') {
                const elements = Array.from(document.querySelectorAll(`.items .BL-item[data-id="${dataId}"]`));
                console.log(`Found ${label} items (data-id=${dataId}):`,
                    elements.map(e => e.getAttribute('data-player-item-id'))
                );

                elements.sort((a, b) => {
                    const aId = parseInt(a.getAttribute('data-player-item-id'), 10);
                    const bId = parseInt(b.getAttribute('data-player-item-id'), 10);
                    return bId - aId; // descending
                });

                const keepAmount = parseInt(localStorage.getItem(keepKey) || 0, 10); // default 0 = drop all
                const toKeep = elements.slice(0, keepAmount);
                const toDrop = elements.slice(keepAmount);

                console.log(`Keeping ${toKeep.length} ${label} (highest IDs), dropping ${toDrop.length}.`);
                return toDrop.map(e => e.getAttribute('data-player-item-id'));
            }

            let beerDropIds = [];
            const REMOVE_BEER = localStorage.getItem('houseKeepingBeer') !== 'false';
            if (REMOVE_BEER) {
                beerDropIds = getDropIdsKeepTopN(141, 'Beer', 'houseKeepingBeerKeep');
            } else {
                console.log("Beer housekeeping disabled via localStorage.");
            }

            let colaDropIds = [];
            const REMOVE_COLA = localStorage.getItem('houseKeepingCola') !== 'false';
            if (REMOVE_COLA) {
                colaDropIds = getDropIdsKeepTopN(142, 'Cola', 'houseKeepingColaKeep');
            } else {
                console.log("Cola housekeeping disabled via localStorage.");
            }

            let shivDropIds = [];
            const REMOVE_SHIV = localStorage.getItem('houseKeepingShiv') !== 'false';
            if (REMOVE_SHIV) {
                shivDropIds = getDropIdsKeepTopN(31, 'Shiv', 'houseKeepingShivKeep');
            } else {
                console.log("Shiv housekeeping disabled via localStorage.");
            }

            let laudDropIds = [];
            const REMOVE_LAUD = localStorage.getItem('houseKeepingLaud') !== 'false';
            if (REMOVE_LAUD) {
                laudDropIds = getDropIdsKeepTopN(138, 'Laud', 'houseKeepingLaudKeep');
            } else {
                console.log("Laudanum housekeeping disabled via localStorage.");
            }

            let cigaretteDropIds = [];
            const REMOVE_CIGS = localStorage.getItem('houseKeepingCigarettes') !== 'false';
            if (REMOVE_CIGS) {
                cigaretteDropIds = getDropIdsKeepTopN(21, 'Cigarettes', 'houseKeepingCigarettesKeep');
            } else {
                console.log("Cigarette housekeeping disabled via localStorage.");
            }

            let trainTicketDropIds = [];
            const REMOVE_TTS = localStorage.getItem('houseKeepingTrainTickets') !== 'false';
            if (REMOVE_TTS) {
                trainTicketDropIds = getDropIdsKeepTopN(13, 'Cigarettes', 'houseKeepingTrainTicketsKeep');
            } else {
                console.log("TrainTicket housekeeping disabled via localStorage.");
            }


            // --- B.4) Popcorn Handling (data-id=144)
            let popcornDropIds = [];
            const REMOVE_POPCORN = (localStorage.getItem('houseKeepingPopcorn') || 'false') === 'true';
            if (REMOVE_POPCORN) {
                const popcornElements = document.querySelectorAll('.items .BL-item[data-id="144"]');
                popcornDropIds = Array.from(popcornElements).map(e => e.getAttribute('data-player-item-id'));
                console.log("Popcorn to drop:", popcornDropIds);
            } else {
                console.log("Popcorn housekeeping disabled via localStorage.");
            }

            // --- B.5) Combine all drop IDs
            const allDropIds = [
                ...thompsonDropIds,
                ...batDropIds,
                ...derringerDropIds,
                ...swSpecialDropIds,
                ...coltM1903DropIds,
                ...beerDropIds,
                ...colaDropIds,
                ...shivDropIds,
                ...laudDropIds,
                ...cigaretteDropIds,
                ...trainTicketDropIds,
                ...popcornDropIds
            ];

            console.log("Final drop list (Thompson, Bat keep 1, leftover Cola, & Popcorn):", allDropIds);

            // --- B.6) Drop them if we have any
            if (allDropIds.length > 0) {
                await processDropItems(allDropIds);
            } else {
                console.log("No items to drop (no leftover Thompson, Cola, or Popcorn).");
            }

            // STEP C: Open the stamp collection

            // Random delay between 4.5 and 6.7 seconds
            const delay = Math.random() * (6.7 - 4.5) + 4.5;
            console.log(`Waiting for ${delay.toFixed(2)} seconds before using the next item.`);
            await new Promise(resolve => setTimeout(resolve, delay * 1000));

            const OPEN_STAMPS = localStorage.getItem('houseKeepingStamps') !== 'false'; // default true
            if (OPEN_STAMPS) {
                const stampsDiv = document.querySelector('.open-stamp-collection');
                if (stampsDiv) {
                    stampsDiv.click();
                    console.log("Stamp collection opened.");
                } else {
                    console.log("Stamp collection button not found.");
                }
            } else {
                console.log("Stamp housekeeping disabled via localStorage.");
            }

            console.log("All done! Used items with data-id=4 and handled dropping of Thompson/Popcorn/extra Cola.");
        });
    });
});
