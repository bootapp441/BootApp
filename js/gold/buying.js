document.addEventListener("DOMContentLoaded", function () {
    $(document).ready(function () {

        const isGoldAlertEnabled = (localStorage.getItem('gold.alert') ?? 'true') === 'true';
        if (isGoldAlertEnabled) {
            console.log('🚫 Gold Alert enabled — exiting buying script.');
            return;
        }

        const discordEnabled = localStorage.getItem('discord.enabled') === 'true';
        const webhookBought = localStorage.getItem('discord.webhook.11');
        const webhookSettings = localStorage.getItem('discord.webhook.12');

        if (!discordEnabled || !webhookBought || !webhookSettings) {
            console.log("🚫 Discord alerts disabled or missing webhook(s) — alerts will be skipped.");
        }

        console.log("Gold Auto-Buyer Script Loaded!");

        const goldMarketURL = window.location.href; // Current page URL

        // ---- FIND THE TARGET DIV INSIDE THE FORM ----
        let targetDiv = $("div:contains('All normal transfer fees apply')");

        if (targetDiv.length) {
            console.log("✅ Found target div inside the form, appending settings...");

            const settingsHTML = `
                <div id="gold-buyer-settings" style="margin-top: 10px; background: rgba(0, 0, 0, 0.8); padding: 10px; border-radius: 8px; color: white; font-size: 14px;">
                    <h3 style="margin: 0 0 10px 0; text-align: center;">Gold Auto-Buyer</h3>
                    
                    <!-- Threshold 1 -->
                    <div style="margin-bottom:6px;">
                      <input type="checkbox" id="t1Enabled" style="transform: scale(1.2); margin-right:4px;">
                      <label style="margin-right:6px;">Threshold 1</label>
                      <label>⚖️ Max Price <span>$</span> <input type="text" id="t1Price" style="width: 90px; text-align: right;"></label>
                      <label style="margin-left:12px;">💰 Budget <span>$</span> <input type="text" id="t1Budget" style="width: 90px; text-align: right;"></label>
                    </div>
                    
                    <!-- Threshold 2 -->
                    <div style="margin-bottom:6px;">
                      <input type="checkbox" id="t2Enabled" style="transform: scale(1.2); margin-right:4px;">
                      <label style="margin-right:6px;">Threshold 2</label>
                      <label>⚖️ Max Price <span>$</span> <input type="text" id="t2Price" style="width: 90px; text-align: right;"></label>
                      <label style="margin-left:12px;">💰 Budget <span>$</span> <input type="text" id="t2Budget" style="width: 90px; text-align: right;"></label>
                    </div>
                    
                    <!-- Threshold 3 -->
                    <div style="margin-bottom:6px;">
                      <input type="checkbox" id="t3Enabled" style="transform: scale(1.2); margin-right:4px;">
                      <label style="margin-right:6px;">Threshold 3</label>
                      <label>⚖️ Max Price <span>$</span> <input type="text" id="t3Price" style="width: 90px; text-align: right;"></label>
                      <label style="margin-left:12px;">💰 Budget <span>$</span> <input type="text" id="t3Budget" style="width: 90px; text-align: right;"></label>
                    </div>

                    <!-- Diversification Input + Button -->
                    <div style="margin-top:8px;">
                      <label>Budget diversification: <input type="text" id="diversifyString" value="95@70:20:10" style="width: 150px;"></label>
                      <button id="applyDiversification" style="background: #555; color: white; padding: 3px 6px; border: none; cursor: pointer; margin-left:4px;">Apply</button>
                    </div>

                    <!-- Refresh Rate + Auto-Buy -->
                    <div style="margin-top:8px;">
                      <label>🔄 Refresh Interval: <input type="number" id="refreshRate" style="width: 50px;"> (e.g. 1.33 for 1m and 20s)</label>
                      <br>
                      <label><input type="checkbox" id="autoBuy" style="transform: scale(1.2); margin-right:4px;"> Auto-Buy Mode</label>
                    </div>

                    <!-- Save & Apply -->
                    <div style="margin-top:8px;">
                      <button id="saveSettings" style="background: green; color: white; padding: 5px; border: none; cursor: pointer;">Save & Apply</button>
                    </div>
                </div>
            `;

            // Append the settings panel **below the target div**
            targetDiv.after(settingsHTML);
        } else {
            console.warn("⚠ Target div for 'Gold Auto-Buyer' panel not found.");
        }

        // ---- LOAD SETTINGS (or set defaults) ----
        function loadSetting(key, defaultValue) {
            return localStorage.getItem(key) !== null ? localStorage.getItem(key) : defaultValue;
        }

        // Threshold 1
        $("#t1Enabled").prop("checked", loadSetting("t1Enabled", "true") === "true");
        $("#t1Price").val(loadSetting("t1Price", "3.100.000"));
        $("#t1Budget").val(loadSetting("t1Budget", "300.000.000"));

        // Threshold 2
        $("#t2Enabled").prop("checked", loadSetting("t2Enabled", "true") === "true");
        $("#t2Price").val(loadSetting("t2Price", "3.200.000"));
        $("#t2Budget").val(loadSetting("t2Budget", "200.000.000"));

        // Threshold 3
        $("#t3Enabled").prop("checked", loadSetting("t3Enabled", "true") === "true");
        $("#t3Price").val(loadSetting("t3Price", "3.300.000"));
        $("#t3Budget").val(loadSetting("t3Budget", "100.000.000"));

        // Diversification
        $("#diversifyString").val(loadSetting("diversifyString", "95@70:20:10"));

        // Refresh & AutoBuy
        $("#refreshRate").val(loadSetting("goldRefreshRate", "5"));
        let autoBuyState = JSON.parse(loadSetting("goldAutoBuy", "false"));
        $("#autoBuy").prop("checked", autoBuyState);

        // ---- MONEY INPUT FORMATTING ----
        function formatMoneyInput(input) {
            let value = input.value.replace(/\D/g, ""); // Remove non-numerics
            if (!value) value = "0";
            value = Number(value).toLocaleString("es-ES"); // Format with dots
            input.value = value;
        }

        // Apply formatting on input
        $("#t1Price, #t2Price, #t3Price, #t1Budget, #t2Budget, #t3Budget").on("input", function () {
            formatMoneyInput(this);
        });

        // ---- APPLY DIVERSIFICATION (on button click) ----
        $("#applyDiversification").on("click", function () {
            try {
                // Attempt to read current player cash from the DOM
                // e.g. <p data-player-stat="cash" data-amount="1436867899">$1,436,867,899</p>
                let rawCash = document.querySelector("p[data-player-stat='cash']")?.getAttribute("data-amount");
                if (!rawCash) {
                    alert("Could not find current cash on the page. Diversification aborted.");
                    return;
                }
                let currentCash = parseInt(rawCash, 10);
                if (!currentCash || currentCash <= 0) {
                    alert("Current cash is invalid. Diversification aborted.");
                    return;
                }

                let diversifyStr = $("#diversifyString").val().trim();
                localStorage.setItem("diversifyString", diversifyStr);

                // Example: "95@70:20:10" => use 95% of cash, then ratio 70:20:10
                // Or "95@70::10" => T2 is disabled
                let parts = diversifyStr.split("@");
                if (parts.length !== 2) {
                    alert("Diversification string must contain '@' (e.g. 95@70:20:10).");
                    return;
                }
                let percentOfCash = parseFloat(parts[0]);
                if (isNaN(percentOfCash) || percentOfCash <= 0 || percentOfCash > 100) {
                    alert("Invalid X% in X@A:B:C");
                    return;
                }

                let ratioStr = parts[1];
                let ratioParts = ratioStr.split(":"); // e.g. ["70","20","10"]
                if (ratioParts.length < 1 || ratioParts.length > 3) {
                    alert("Diversification must have up to 3 ratio parts (e.g. 70:20:10 or 70::10).");
                    return;
                }

                let totalUse = Math.floor(currentCash * (percentOfCash / 100));
                if (totalUse < 1) {
                    alert("Resulting total budget is too small.");
                    return;
                }

                // We'll interpret ratioParts in order: T1, T2, T3
                // If a ratio is empty => that threshold is disabled
                let numericRatios = ratioParts.map(r => parseFloat(r) || 0);
                // e.g. if ratioParts = ["70","","10"] => numericRatios = [70, 0, 10]

                // Count how many are > 0
                let sumRatios = numericRatios.reduce((a, b) => a + b, 0);

                // T1
                if (numericRatios[0] > 0) {
                    let portion = Math.floor(totalUse * (numericRatios[0] / sumRatios));
                    $("#t1Budget").val(portion.toLocaleString("es-ES"));
                    $("#t1Enabled").prop("checked", true);
                } else {
                    $("#t1Enabled").prop("checked", false);
                    $("#t1Budget").val("0");
                }

                // T2
                if (numericRatios.length >= 2 && numericRatios[1] > 0) {
                    let portion = Math.floor(totalUse * (numericRatios[1] / sumRatios));
                    $("#t2Budget").val(portion.toLocaleString("es-ES"));
                    $("#t2Enabled").prop("checked", true);
                } else if (ratioParts.length >= 2) {
                    // ratio part is present but zero => disable
                    $("#t2Enabled").prop("checked", false);
                    $("#t2Budget").val("0");
                }

                // T3
                if (numericRatios.length === 3 && numericRatios[2] > 0) {
                    let portion = Math.floor(totalUse * (numericRatios[2] / sumRatios));
                    $("#t3Budget").val(portion.toLocaleString("es-ES"));
                    $("#t3Enabled").prop("checked", true);
                } else if (ratioParts.length === 3) {
                    $("#t3Enabled").prop("checked", false);
                    $("#t3Budget").val("0");
                }

                alert("Diversification applied. Adjust if desired, then click 'Save & Apply'.");
            } catch (err) {
                console.error("Error applying diversification:", err);
                alert("Error applying diversification. Check console for details.");
            }
        });

        // ---- SAVE & APPLY SETTINGS ----
        function applySettings() {
            // Threshold 1
            localStorage.setItem("t1Enabled", $("#t1Enabled").prop("checked"));
            localStorage.setItem("t1Price", $("#t1Price").val());
            localStorage.setItem("t1Budget", $("#t1Budget").val());

            // Threshold 2
            localStorage.setItem("t2Enabled", $("#t2Enabled").prop("checked"));
            localStorage.setItem("t2Price", $("#t2Price").val());
            localStorage.setItem("t2Budget", $("#t2Budget").val());

            // Threshold 3
            localStorage.setItem("t3Enabled", $("#t3Enabled").prop("checked"));
            localStorage.setItem("t3Price", $("#t3Price").val());
            localStorage.setItem("t3Budget", $("#t3Budget").val());

            // Refresh Rate & AutoBuy
            localStorage.setItem("goldRefreshRate", $("#refreshRate").val());
            localStorage.setItem("goldAutoBuy", JSON.stringify($("#autoBuy").prop("checked")));

            console.log("✅ Settings saved and applied.");

            // Send to Discord
            sendSettingsUpdateToDiscord();

            let autoBuyEnabled = $("#autoBuy").prop("checked");
            if (autoBuyEnabled) {
                console.log("🔄 Restarting Auto-Buy with new settings...");
                startAutoRefresh();
                checkGoldOffers();
            } else {
                console.log("⏹ Auto-Buy disabled.");
                clearInterval(refreshTimer);
            }
        }

        $("#saveSettings").click(applySettings);
        $("#autoBuy").change(applySettings);

        // ---- DISCORD NOTIFICATIONS ----
        function sendDiscordNotification(goldAmount, pricePerGold, totalCost, thresholdName) {
            var username = $('.username').text().trim() || "Unknown";

            const payload = {
                content: ``,
                embeds: [
                    {
                        description: `Bought **${goldAmount}g** at **$${pricePerGold.toLocaleString()}** (Threshold: ${thresholdName})\nCost: **$${totalCost.toLocaleString()}**\nUser: ${username}`,
                        color: 15844367
                    }
                ]
            };

            if (!discordEnabled || !webhookBought) return;
            fetch(webhookBought, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }).then(response => console.log("📡 Discord Notification Sent!"))
                .catch(error => console.error("⚠ Error sending Discord notification:", error));
        }

        function sendSettingsUpdateToDiscord() {
            let t1P = $("#t1Price").val(); let t1B = $("#t1Budget").val(); let t1E = $("#t1Enabled").prop("checked");
            let t2P = $("#t2Price").val(); let t2B = $("#t2Budget").val(); let t2E = $("#t2Enabled").prop("checked");
            let t3P = $("#t3Price").val(); let t3B = $("#t3Budget").val(); let t3E = $("#t3Enabled").prop("checked");
            let diversifyStr = $("#diversifyString").val().trim();
            let refreshRate = $("#refreshRate").val();
            let autoBuy = $("#autoBuy").prop("checked");

            let username = $(".username").text().trim() || "Unknown User";

            // Build a text block of enabled thresholds
            function line(thName, enabled, price, budg) {
                if (!enabled) return `~~${thName} disabled~~`;
                return `**${thName}:** ⚖️ < $${price} @ 💰 $${budg}`;
            }

            let desc = [
                line("T1", t1E, t1P, t1B),
                line("T2", t2E, t2P, t2B),
                line("T3", t3E, t3P, t3B),
                `📡 **Diversification:** ${diversifyStr}`,
                `🔄 **Refresh Interval:** ${refreshRate} min`,
                `✅ **Auto-Buy:** ${autoBuy ? "On" : "Off"}`,
                `👤 **User:** ${username}`
            ].join("\n");

            const payload = {
                content: "",
                embeds: [
                    {
                        description: desc,
                        color: 15844367 // Gold color
                    }
                ]
            };

            if (!discordEnabled || !webhookSettings) return;
            fetch(webhookSettings, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }).then(response => console.log("📡 Settings Update Sent to Discord!"))
                .catch(error => console.error("⚠ Error sending settings update:", error));
        }

        // ---- HELPER: parse local storage thresholds ----
        function parseThreshold(index) {
            // index is 1, 2, or 3
            let enabled = (localStorage.getItem(`t${index}Enabled`) === "true");
            let priceText = localStorage.getItem(`t${index}Price`) || "0";
            let budgetText = localStorage.getItem(`t${index}Budget`) || "0";

            let price = parseInt(priceText.replace(/\D/g, "")) || 0;
            let budget = parseInt(budgetText.replace(/\D/g, "")) || 0;

            return {
                enabled: enabled,
                price: price,
                budget: budget,
            };
        }

        // ---- CHECK GOLD OFFERS & BUY (if criteria met) ----
        function checkGoldOffers() {
            console.log("🔍 Checking gold marketplace...");

            let autoBuyEnabled = $("#autoBuy").prop("checked");

            // Load threshold settings from localStorage (fresh each time)
            let t1 = parseThreshold(1);
            let t2 = parseThreshold(2);
            let t3 = parseThreshold(3);

            let goldMarketTable = $("table.sub2").has("td.header:contains('Gold marketplace')");
            if (goldMarketTable.length === 0) {
                console.warn("⚠ 'Gold Marketplace' table not found.");
                return;
            }

            let attempts = 0;
            let purchases = 0;

            goldMarketTable.find("tr:gt(1)").each(function () {
                if (attempts >= 10) return; // Only check first 10 offers

                let amountText = $(this).find("td:nth-child(1) span:first").text().trim();
                let batchText = $(this).find("td:nth-child(1) span:nth-child(3)").text().trim();
                let priceText = $(this).find("td:nth-child(2) span:first").text().trim();
                let inputField = $(this).find("td:nth-child(3) input");

                if (!amountText || !priceText || !inputField.length) return;

                let pricePerGold = parseInt(priceText.replace(/\D/g, ""));
                let sellerGoldAvailable = parseInt(amountText.replace(/\D/g, ""));

                if (!pricePerGold || !sellerGoldAvailable) return;

                // Try buying from each threshold in order: T1 -> T2 -> T3
                function tryBuy(th, thName) {
                    if (!th.enabled || th.budget <= 0 || pricePerGold > th.price) return false;

                    let totalCost = pricePerGold * sellerGoldAvailable;
                    let goldAmountToBuy = sellerGoldAvailable;
                    let batchSize = 1;
                    let batchesAvailable = 1;

                    if (batchText.includes("Batches of")) {
                        let batchMatch = batchText.match(/Batches of (\d+) \((\d+) available\)/);
                        if (batchMatch) {
                            batchSize = parseInt(batchMatch[1]);
                            batchesAvailable = parseInt(batchMatch[2]);
                        }

                        let maxBatchesAffordable = Math.floor(th.budget / (batchSize * pricePerGold));
                        let batchesToBuy = Math.min(maxBatchesAffordable, batchesAvailable);
                        goldAmountToBuy = batchSize * batchesToBuy;
                        totalCost = goldAmountToBuy * pricePerGold;

                        if (batchesToBuy <= 0) {
                            console.log(`❌ [${thName}] Skipping - cannot afford even one batch of ${batchSize}.`);
                            return false;
                        }
                        console.log(`⚠ [${thName}] Batch detected. Buying ${batchesToBuy} batch(es) of ${batchSize} => ${goldAmountToBuy} gold.`);
                    } else {
                        let maxGoldAffordable = Math.floor(th.budget / pricePerGold);
                        goldAmountToBuy = Math.min(maxGoldAffordable, sellerGoldAvailable);
                        totalCost = goldAmountToBuy * pricePerGold;
                    }

                    if (goldAmountToBuy <= 0) return false;

                    console.log(`🔹 [${thName}] Attempting to buy ${goldAmountToBuy} gold at $${pricePerGold} => $${totalCost}.`);
                    attempts++;

                    if (totalCost <= th.budget) {
                        console.log(`✅ [${thName}] Buying ${goldAmountToBuy} gold. Cost: $${totalCost}`);

                        // Fill input field & highlight row
                        inputField.val(goldAmountToBuy);
                        $(this).css("background-color", "#3E533E");

                        // Deduct from threshold budget
                        th.budget -= totalCost;
                        purchases++;

                        // Immediately update localStorage and send new settings to Discord
                        let newBudget = th.budget;
                        let budgetField = $(`#t${thName.slice(1)}Budget`);
                        budgetField.val(newBudget.toLocaleString("es-ES")); // Update DOM input field
                        localStorage.setItem(`t${thName.slice(1)}Budget`, newBudget.toLocaleString("es-ES"));
                        sendSettingsUpdateToDiscord(); // Now it reads the correct updated values

                        if (autoBuyEnabled) {
                            // Execute the purchase after a small delay
                            setTimeout(() => {
                                $("input[type='submit'][value='Buy!']").click();
                                sendDiscordNotification(goldAmountToBuy, pricePerGold, totalCost, thName);
                            }, 100);
                        }
                        return true;
                    } else {
                        console.log(`❌ [${thName}] Not enough budget. Need $${totalCost}, have $${th.budget}.`);
                        return false;
                    }
                }

                // Check T1 -> T2 -> T3, stop if one succeeds
                if (tryBuy.call(this, t1, "T1")) return;
                if (tryBuy.call(this, t2, "T2")) return;
                if (tryBuy.call(this, t3, "T3")) return;
            });

            if (purchases === 0) console.log("❌ No suitable offers found or no purchases made within first 10 listings.");
        }

        // ---- REFRESH GOLD LISTINGS (stealth) ----
        function refreshGoldListings() {
            console.log("🔄 Refreshing gold listings (stealth mode)...");

            fetch(goldMarketURL, {
                method: "GET",
                headers: {
                    "Referer": document.referrer || goldMarketURL,
                    "User-Agent": navigator.userAgent
                }
            })
                .then(response => response.text())
                .then(responseText => {
                    let parser = new DOMParser();
                    let newDocument = parser.parseFromString(responseText, "text/html");
                    let newTable = newDocument.querySelector("table.sub2");

                    if (!newTable) {
                        console.log("⚠ Could not find updated gold marketplace table. Possibly changed markup.");
                        return;
                    }

                    document.querySelector("table.sub2").innerHTML = newTable.innerHTML;
                    console.log("✅ Gold listings updated stealthily.");
                    checkGoldOffers();
                })
                .catch(error => console.error("⚠ Failed to refresh gold listings.", error));
        }

        // ---- AUTO-REFRESH TIMER ----
        let refreshTimer;
        function startAutoRefresh() {
            clearInterval(refreshTimer);
            let refreshMinutes = parseFloat($("#refreshRate").val()) || 5;
            let minMinutes = 10 / 60; // 10 seconds in minutes

            if (refreshMinutes * 60 < 10) {
                console.warn("⏱️ Refresh interval too low. Forcing to 10 seconds.");
                refreshMinutes = minMinutes;
                $("#refreshRate").val(minMinutes.toFixed(2));
            }

            // random offset ±25%
            let randomFactor = (Math.random() * 0.5) - 0.25;
            let randomizedInterval = refreshMinutes * 60 * 1000 * (1 + randomFactor);

            console.log(`🔄 Auto-refresh set to ~${(randomizedInterval / 1000).toFixed(1)} seconds`);

            refreshTimer = setInterval(refreshGoldListings, randomizedInterval);
        }

        // ---- INIT if autoBuy was active on page load ----
        if (autoBuyState) {
            startAutoRefresh();
            checkGoldOffers();
        }
    });
});