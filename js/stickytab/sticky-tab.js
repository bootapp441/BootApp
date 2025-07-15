document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => { // Delay execution by 1.5 seconds
        const isConsoleLogEnabled = (localStorage.getItem('sticky.consoleLog') ?? 'false') === 'true';
        
        const isStickyEnabled = (localStorage.getItem('sticky.enabled') ?? 'false') === 'true';
        if (!isStickyEnabled) {
            if (isConsoleLogEnabled) console.log('🚫 Sticky Tabs disabled — exiting script.');
            return;
        }

        if (isConsoleLogEnabled) console.log("✅ Script started after 1.5 seconds delay. Checking for monitored pages.");

        const storedPagesText = localStorage.getItem('sticky.pages') ?? 
        `https://www.bootleggers.us/forum_new/index.php?flag=1&goto=616827
        https://www.bootleggers.us/auto-theft.php
        https://www.bootleggers.us/bootlegging.php
        https://www.bootleggers.us/crimes.php
        https://www.bootleggers.us/rackets.php`;
        
        const monitoredPages = storedPagesText
            .split("\n")
            .map(url => url.trim())
            .filter(url => url !== "")
            .slice(0, 10);
        
        if (isConsoleLogEnabled) console.log("📄 Monitored pages loaded:", monitoredPages);

        const STORAGE_KEY = "tabTracker";

        const CHECK_INTERVAL = parseInt(localStorage.getItem('sticky.interval') ?? '5000', 10);
        const ANOMALY_THRESHOLD = parseInt(localStorage.getItem('sticky.anomaly') ?? '6000', 10);
        const CLEANUP_THRESHOLD = parseInt(localStorage.getItem('sticky.cleanup') ?? '60000', 10);

        // Function to add a new row below the logout button
        function addUrlManagerRow() {
            const logoutRow = document.querySelector(".menu_header a[href*='logout.php']")?.closest("tr");

            if (logoutRow) {
                const newRow = document.createElement("tr");
                newRow.innerHTML = `
                    <td colspan="1" style="padding: 5px; text-align: center;">
                        <textarea id="monitoredUrls" style="width: 80px; height: 80px; font-size: 12px;" 
                                  placeholder="Enter up to 10 URLs, one per line...">${monitoredPages.join("\n")}</textarea>
                        <br>
                        <button id="saveUrls" style="margin-top: 5px; padding: 5px; font-size: 12px; cursor: pointer;">
                            💾 Sticky URLs
                        </button>
                    </td>
                `;

                logoutRow.parentNode.insertBefore(newRow, logoutRow.nextSibling);

                // Add event listener to the save button
                document.getElementById("saveUrls").addEventListener("click", function () {
                    let newUrls = document.getElementById("monitoredUrls").value
                        .split("\n").map(url => url.trim()).filter(url => url !== "");

                    if (newUrls.length > 10) {
                        alert("⚠️ You can only save up to 10 URLs.");
                        return;
                    }

                    localStorage.setItem("monitoredPages", JSON.stringify(newUrls));
                    alert("✅ URLs saved! Reload the page to apply changes.");
                });

            } else {
                console.warn("⚠️ Could not find the Logout button to attach the URL manager.");
            }
        }

        // addUrlManagerRow();

        // Ensure each tab has a unique identifier
        if (!window.name) {
            window.name = `tab_${Math.random().toString(36).substr(2, 9)}`;
            if (isConsoleLogEnabled) console.log(`🆕 Assigned unique tab identifier: ${window.name}`);
        } else {
            if (isConsoleLogEnabled) console.log(`🔄 Tab identifier exists: ${window.name}`);
        }

        // Function to update LocalStorage with current tab info
        function updateTabTracking() {
            let trackedTabs = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

            // Remove stale tabs (tabs that haven't updated in 60+ seconds)
            let currentTime = Date.now();
            for (let tab in trackedTabs) {
                if (currentTime - trackedTabs[tab].timestamp > CLEANUP_THRESHOLD) {
                    if (isConsoleLogEnabled) console.log(`🗑 Removing stale tab entry: ${tab}`);
                    delete trackedTabs[tab];
                }
            }

            // Update the current tab's info
            trackedTabs[window.name] = {
                url: window.location.href,
                timestamp: currentTime
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(trackedTabs));
            if (isConsoleLogEnabled) console.log(`📌 Updated tab tracking for: ${window.name} (${window.location.href})`);
        }

        // Function to check for anomalies
        function checkForAnomalies() {
            let trackedTabs = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
            let openPages = Object.values(trackedTabs).map(tab => tab.url);
            let currentTime = Date.now();

            if (isConsoleLogEnabled) console.log("📊 Checking for anomalies...");
            if (isConsoleLogEnabled) console.log("🌍 Currently open monitored pages:", openPages.filter(url => monitoredPages.includes(url)));

            // Only consider monitored pages
            openPages = openPages.filter(url => monitoredPages.includes(url));

            // Find missing pages
            let missingPages = monitoredPages.filter(url => !openPages.includes(url));
            if (isConsoleLogEnabled) console.log("❓ Missing pages:", missingPages.length > 0 ? missingPages : "None");

            // Identify duplicate pages
            let pageOccurrences = {};
            for (let url of openPages) {
                pageOccurrences[url] = (pageOccurrences[url] || 0) + 1;
            }

            let duplicatePages = Object.entries(pageOccurrences)
                .filter(([url, count]) => count > 1)
                .map(([url]) => url);

            if (isConsoleLogEnabled) console.log("🔁 Duplicate pages detected:", duplicatePages.length > 0 ? duplicatePages : "None");

            // Identify outdated tabs
            let outdatedTabs = Object.entries(trackedTabs).filter(([tabName, tabData]) => {
                return monitoredPages.includes(tabData.url) && (currentTime - tabData.timestamp) > ANOMALY_THRESHOLD;
            });

            if (isConsoleLogEnabled) console.log("⏳ Outdated tabs detected:", outdatedTabs.length > 0 ? outdatedTabs.map(t => t[0]) : "None");

            // Handle missing pages by redirecting one of the duplicates
            if (missingPages.length > 0 && duplicatePages.length > 0) {
                let missingPage = missingPages[0]; // Pick the first missing page
                let duplicatePage = duplicatePages[0]; // Pick the first duplicate page

                // Find a tab currently displaying the duplicate page
                let duplicateTab = Object.entries(trackedTabs).find(([tabName, tabData]) => tabData.url === duplicatePage);

                if (duplicateTab) {
                    let [tabName, tabData] = duplicateTab;
                    console.warn(`⚠️ Anomaly detected: Redirecting duplicate tab (${tabName}) from ${duplicatePage} to ${missingPage}`);

                    if (window.name === tabName) {
                        if (isConsoleLogEnabled) console.log(`🔄 Redirecting this tab (${window.name}) to ${missingPage}`);
                        window.location.href = missingPage; // Redirect the current tab
                    }
                }
            }

            // Handle missing pages by redirecting an outdated tab if no duplicates exist
            if (missingPages.length > 0 && outdatedTabs.length > 0) {
                let missingPage = missingPages[0]; // Pick the first missing page
                let [tabName, tabData] = outdatedTabs[0]; // Pick the first outdated tab

                console.warn(`⚠️ Anomaly detected: Redirecting outdated tab (${tabName}) to ${missingPage}`);

                if (window.name === tabName) {
                    if (isConsoleLogEnabled) console.log(`🔄 Redirecting this outdated tab (${window.name}) to ${missingPage}`);
                    window.location.href = missingPage; // Redirect the current tab
                }
            }

            if (isConsoleLogEnabled) console.log("✅ Anomaly check completed.");
        }

        // Initial update on load
        updateTabTracking();

        // Periodically update and verify tabs
        setInterval(() => {
            updateTabTracking();
            checkForAnomalies();
        }, CHECK_INTERVAL);
    }, 1500); // Delay execution by 1.5 seconds
});
