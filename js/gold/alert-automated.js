document.addEventListener('DOMContentLoaded', function () {
  $(document).ready(function () {

    const isGoldAlertEnabled = (localStorage.getItem('gold.alert') ?? 'false') === 'true';
    if (!isGoldAlertEnabled) {
      console.log('🚫 Gold Alert disabled — exiting script.');
      return;
    }

    /* ========== CONFIGURATION ========== */
    const goldMarketURL = '/gold.php?page=6';
    const discordEnabled = localStorage.getItem('discord.enabled') === 'true';
    const goldAlertWebhook = localStorage.getItem('discord.webhook.9');   // Gold Prices
    const goldBaselineWebhook = localStorage.getItem('discord.webhook.10'); // Gold Baseline

    const ORANGE_COLOR_DEC = 16753920; // #FFA500 in decimal

    const ALERT_THRESHOLD_PERCENT = parseFloat(localStorage.getItem('gold.trigger') ?? '0.075');
    const RECOVERY_THRESHOLD_PERCENT = parseFloat(localStorage.getItem('gold.recovery') ?? '0.03');
    const ALERT_COOLDOWN_MS = parseInt(localStorage.getItem('gold.cooldown') ?? '300000', 10);
    const BASE_INTERVAL_MS = parseInt(localStorage.getItem('gold.interval') ?? '8000', 10);
    const SKIP_BATCHSIZE = parseInt(localStorage.getItem('gold.skip') ?? '95000', 10);
    const HOURLY_REPORT_MS = parseInt(localStorage.getItem('gold.alert.baseline') ?? '3600000', 10);

    /* ========== INTERNAL STATE ========== */
    let lastBaselinePrice = null;
    let lastAlertedPrice = null;   // Helps avoid re-alerting the same price
    let lastAlertTime = 0;
    let lastHourlyReportTime = 0;  // When we last sent a baseline report
    let refreshTimer = null;

    /* ========== LOCAL STORAGE ========== */
    function loadFromLocalStorage() {
      // baseline price
      const storedBaseline = localStorage.getItem('lastBaselinePrice');
      if (storedBaseline) {
        let parsed = parseFloat(storedBaseline);
        lastBaselinePrice = isNaN(parsed) ? null : parsed;
      }

      // last alerted price
      const storedLastAlerted = localStorage.getItem('lastAlertedPrice');
      if (storedLastAlerted) {
        let parsedAlerted = parseFloat(storedLastAlerted);
        lastAlertedPrice = isNaN(parsedAlerted) ? null : parsedAlerted;
      }

      // last alert timestamp
      const storedAlertTime = localStorage.getItem('lastAlertTime');
      if (storedAlertTime) {
        lastAlertTime = parseInt(storedAlertTime, 10) || 0;
      }

      // last hourly report
      const storedHourly = localStorage.getItem('lastHourlyReportTime');
      if (storedHourly) {
        lastHourlyReportTime = parseInt(storedHourly, 10) || 0;
      }
    }

    function saveToLocalStorage() {
      localStorage.setItem('lastBaselinePrice', String(lastBaselinePrice));
      localStorage.setItem('lastAlertedPrice', String(lastAlertedPrice));
      localStorage.setItem('lastAlertTime', String(lastAlertTime));
      localStorage.setItem('lastHourlyReportTime', String(lastHourlyReportTime));
    }

    /**
     * Convert a price string like "$4,000,000" into 4000000 (numeric).
     */
    function parsePrice(priceString) {
      return parseFloat(priceString.replace(/[^\d.]/g, ''));
    }

    function formatPrice(value) {
      return '$' + Number(value).toLocaleString();
    }

    /**
     * Returns true if we've passed the cooldown since last alert.
     */
    function canSendAlert() {
      let now = Date.now();
      return (now - lastAlertTime) > ALERT_COOLDOWN_MS;
    }

    /**
     * Sends a "price drop" alert to your main Discord webhook.
     * We'll include the price, the gold amount, and whether it's a batch or individual.
     */
    function sendAlert(priceText, goldAmountText, saleType) {
      if (!discordEnabled || !goldAlertWebhook) {
        console.log('🚫 Gold Alert skipped — Discord disabled or webhook not set.');
        return;
      }

      let data = {
        content: '',
        embeds: [
          {
            description:
              `**New Price Drop Detected**\n` +
              `Price: **${priceText}**\n` +
              `Gold Amount: **${goldAmountText}**\n` +
              `Type: **${saleType}**`,
            color: 15844367 // a gold-ish color in decimal
          }
        ]
      };

      $.ajax({
        url: DISCORD_WEBHOOK_URL,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function () {
          console.log('✅ Alert sent:', priceText, goldAmountText, saleType);
        },
        error: function (xhr, status, error) {
          console.error('❌ Error sending alert:', error);
        }
      });
    }

    /**
     * Sends the baseline value to the second webhook (orange color), once an hour max.
     */
    function sendBaselineReport() {
      if (!discordEnabled || !goldBaselineWebhook || lastBaselinePrice === null) {
        console.log('⏭ Baseline report skipped.');
        return;
      }
      
      if (lastBaselinePrice === null) return; // no baseline, skip

      let data = {
        content: '',
        embeds: [
          {
            description: `Baseline Report: **${formatPrice(lastBaselinePrice)}**`,
            color: ORANGE_COLOR_DEC
          }
        ]
      };

      $.ajax({
        url: DISCORD_BASELINE_WEBHOOK_URL,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function () {
          console.log('✅ Baseline report sent:', lastBaselinePrice);
        },
        error: function (xhr, status, error) {
          console.error('❌ Error sending baseline report:', error);
        }
      });
    }

    /**
     * Compare the new lowest price to our baseline, decide if we should alert or update.
     * newPrice = numeric price
     * priceText = e.g. "$4,100,000"
     * goldQty = e.g. "10" or "250000" (the bold # in row)
     * saleType = "Batch" or "Individual"
     */
    function handleLowestPrice(newPrice, priceText, goldQty, saleType) {
      // If we have no baseline yet, set it
      if (lastBaselinePrice === null) {
        lastBaselinePrice = newPrice;
        saveToLocalStorage();
        return;
      }

      let dropThreshold = lastBaselinePrice * (1 - ALERT_THRESHOLD_PERCENT);

      // Check if new price is >= 10% below baseline
      if (newPrice < dropThreshold) {
        // Avoid re-alerting same price if still on cooldown
        if (newPrice !== lastAlertedPrice && canSendAlert()) {
          sendAlert(priceText, goldQty, saleType);
          lastAlertTime = Date.now();
          lastAlertedPrice = newPrice;
          // Baseline becomes this new lower price
          lastBaselinePrice = newPrice;
          saveToLocalStorage();
        }
      }
      else {
        // If price recovers enough above baseline, raise the baseline
        let recoveryThreshold = lastBaselinePrice * (1 + RECOVERY_THRESHOLD_PERCENT);
        if (newPrice > recoveryThreshold) {
          lastBaselinePrice = newPrice;
          console.log('⚖ Baseline raised to', lastBaselinePrice);
          saveToLocalStorage();
        }
      }
    }

    /**
     * Finds the SINGLE lowest valid offer from the table, skipping:
     *  - rows w/o inputCell
     *  - batches of >= 95,000
     *
     * Returns an object { value, text, qty, saleType }
     *  value = numeric price
     *  text = "$4,100,000"
     *  qty = "250000" or "10" (the main bold number in column 0)
     *  saleType = "Batch" or "Individual"
     */
    function findLowestPrice() {
      let lowestVal = Infinity;
      let lowestText = '';
      let lowestQty = '';
      let lowestSaleType = '';

      // Inspect all "offer" rows
      $('tr:not(.sub3)').each(function () {
        let row = $(this);

        // Does this row have an offer input?
        let inputCell = row.find('td').eq(2).find('input[name^="offer["]');
        if (inputCell.length === 0) {
          return; // skip non-offer rows
        }

        // Grab the italic text from first cell to see if it's "Batches of XXX" or "Sold individually"
        let typeSpan = row.find('td').eq(0).find('span[style*="font-style: italic"]');
        let typeText = (typeSpan.text() || '').trim();

        // We'll detect the sale type
        let isBatch = false;
        let batchSize = 0;

        // e.g. "Batches of 250,000 (1 available)" or "Sold individually"
        // We can check if it includes "Batches of"
        if (typeText.toLowerCase().includes('batches of')) {
          isBatch = true;
          // Attempt to parse the number after "Batches of "
          // Quick approach: "Batches of 250,000" -> get "250,000" -> parse
          let match = typeText.match(/Batches of\s+([\d,]+)/i);
          if (match && match[1]) {
            batchSize = parseInt(match[1].replace(/[^\d]/g, ''), 10);
          }
          // If batchSize >= 95,000, skip
          if (batchSize >= SKIP_BATCHSIZE) {
            return; // skip this row entirely
          }
        }

        // Next, get the main bold quantity in the first cell:
        // e.g. "250,000" or "10" ...
        let quantityBold = row.find('td').eq(0).find('span[style*="font-weight:bold; font-size: 19px"]');
        let qtyText = (quantityBold.text() || '').trim().replace(/[^\d]/g, '');
        if (!qtyText) {
          // fallback if needed
          qtyText = row.find('td').eq(0).text().trim();
        }

        // Then check the second cell's bold price
        let priceCell = row.find('td').eq(1).find('span[style*="font-weight:bold"]');
        if (priceCell.length > 0) {
          let priceText = priceCell.text().trim();
          let numericVal = parsePrice(priceText);
          if (!isNaN(numericVal) && numericVal < lowestVal) {
            lowestVal = numericVal;
            lowestText = priceText;
            lowestQty = qtyText || '?';
            lowestSaleType = isBatch ? 'Batch' : 'Individual';
          }
        }
      });

      if (lowestVal === Infinity) {
        return null; // no valid offer found
      }

      return {
        value: lowestVal,
        text: lowestText,
        qty: lowestQty,
        saleType: lowestSaleType
      };
    }

    /**
     * Refresh the gold listings, update the table, do an hourly baseline check,
     * then see if there's a new lowest price for an alert.
     */
    function refreshGoldListings() {
      console.log("🔄 Refreshing gold listings...");

      // Check if we should send hourly baseline report
      let now = Date.now();
      if ((now - lastHourlyReportTime) >= HOURLY_REPORT_MS) {
        sendBaselineReport();
        lastHourlyReportTime = now;
        saveToLocalStorage();
      }

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

          if (newTable) {
            let currentTable = document.querySelector("table.sub2");
            if (currentTable) {
              // Replace the existing table content
              currentTable.innerHTML = newTable.innerHTML;
              console.log("✅ Gold listings updated.");

              // find the single lowest valid price
              let lowestObj = findLowestPrice();
              if (lowestObj) {
                handleLowestPrice(
                  lowestObj.value,
                  lowestObj.text,
                  lowestObj.qty,
                  lowestObj.saleType
                );
              }
            }
          }
        })
        .catch(error => {
          console.error("⚠ Failed to refresh gold listings.", error);
        });
    }

    /**
     * Starts the auto-refresh on an interval around BASE_INTERVAL_MS ± RANDOM_OFFSET.
     */
    function startAutoRefresh() {
      clearInterval(refreshTimer);
      let randomFactor = (Math.random() * 0.5) - 0.25; // between -25% and +25%
      let randomizedInterval = BASE_INTERVAL_MS * (1 + randomFactor);
      console.log(`🔄 Auto-refresh in ~${(randomizedInterval / 1000).toFixed(2)}s`);
      refreshTimer = setInterval(refreshGoldListings, randomizedInterval);
    }

    /* ========== INITIALIZATION ========== */
    loadFromLocalStorage();

    // Immediately find the current lowest (if table is loaded) and handle it
    let lowestObj = findLowestPrice();
    if (lowestObj) {
      handleLowestPrice(lowestObj.value, lowestObj.text, lowestObj.qty, lowestObj.saleType);
    }

    // Start refresh cycle
    startAutoRefresh();

  });
});
