document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        const webhookUrl = localStorage.getItem('discord.webhook.2');
        const discordEnabled = localStorage.getItem('discord.enabled') === 'true';

        // Define cities with their names, tdIndex, and row range
        const cityGroups = [
            {
                name: "Group 1",
                cities: [
                    { name: "Chicago", tdIndex: 2, rowRange: [3, 10] },
                    { name: "Detroit", tdIndex: 3, rowRange: [3, 10] },
                    { name: "Cincinnati", tdIndex: 4, rowRange: [3, 10] },
                    { name: "New York City", tdIndex: 5, rowRange: [3, 10] }
                ]
            },
            {
                name: "Group 2",
                cities: [
                    { name: "Atlantic City", tdIndex: 2, rowRange: [13, 20] },
                    { name: "New Orleans", tdIndex: 3, rowRange: [13, 20] },
                    { name: "Rocky Mount", tdIndex: 4, rowRange: [19, 20], jacksOnly: true }  // Only Jacks for Rocky Mount
                ]
            }
        ];

        const categories = [" Slot", " Roulette", " Bullet", " Race", " Blackjack", " Keno", " Jacks"];

        // Function to build and send a table message for each group
        function buildAndSendTableMessage(cityGroup) {
            const tableData = {};

            // Initialize table structure
            categories.forEach(category => {
                tableData[category] = cityGroup.cities.map(() => "");  // Empty columns for each city
            });

            // Populate tableData with owner and price for each city and category
            cityGroup.cities.forEach((city, cityIndex) => {
                const rows = $('table.sub2.centered.states-page tbody tr').slice(city.rowRange[0], city.rowRange[1]);
                rows.each(function (index) {
                    const category = city.jacksOnly ? " Jacks" : categories[index];
                    const targetTd = $(this).find(`td:nth-child(${city.tdIndex})`);
                    let fullText = targetTd.text().trim();

                    // Extract owner name and price
                    let owner = fullText.split(/\$|,|Unlimited/)[0].trim() || "Unknown";
                    let price = targetTd.find('div').last().text().trim() || 'N/A';

                    // Handle "Unlimited" or empty price cases
                    if (!price || price === '$0') {
                        price = targetTd.find('div:contains("Unlimited")').text().trim() || 'N/A';
                    }

                    // Format as "Owner (Price)" and store in tableData
                    tableData[category][cityIndex] = `${owner} (${price})`;
                });
            });

            // Calculate maximum width for each column, adding a bit of extra padding
            const columnWidths = cityGroup.cities.map((_, cityIndex) => {
                return Math.max(...categories.map(category => tableData[category][cityIndex].length), cityGroup.cities[cityIndex].name.length) + 3;
            });

            // Build the Markdown-like table
            // let message = `**${cityGroup.name} Casino Overview**\n\n`;
            let message = "```\n";  // Start code block
            message += `Category       | ${cityGroup.cities.map((city, i) => city.name.padEnd(columnWidths[i])).join(" | ")}\n`;
            message += `---------------|${cityGroup.cities.map((_, i) => "-".repeat(columnWidths[i] + 2)).join("|").slice(0, -10)}\n`;  // Remove 10 dashes from the end

            categories.forEach(category => {
                if (cityGroup.cities.some((city, i) => tableData[category][i])) {
                    message += ` ${category.padEnd(13)} | ${tableData[category].map((entry, i) => entry.padEnd(columnWidths[i])).join(" | ")}\n`;
                }
            });

            message += "```\n";  // End code block

            // Send the message to Discord
            if (discordEnabled && webhookUrl) {

                fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content: message.trim() })
                }).then(response => {
                    if (response.ok) {
                        console.log(`Table for ${cityGroup.name} sent to Discord successfully!`);
                    } else {
                        console.error(`Failed to send table for ${cityGroup.name}`, response.status, response.statusText);
                    }
                }).catch(error => console.error('Error:', error));
            } else {
                console.warn(`Discord disabled or missing webhook. Skipped sending: ${cityGroup.name}`);
            }
        }

        // Sequentially send messages for both city groups
        buildAndSendTableMessage(cityGroups[0]);  // Send Group 1 first
        setTimeout(() => buildAndSendTableMessage(cityGroups[1]), 3000);  // Delay to send Group 2 after Group 1

        // Function to simulate hyperlink click
        function simulateHyperlinkClick() {
            const link = document.createElement('a');
            link.href = window.location.href;
            link.click();
        }

        // Random reload or refresh every 10 - 50 minutes
        const randomReloadTime = Math.random() * (3000000 - 600000) + 600000; // 10 to 50 minutes in milliseconds
        setTimeout(() => {
            const randomChance = Math.random();
            if (randomChance < 0.7) {
                console.log("Simulating hyperlink click to reload the page (70% chance)");
                simulateHyperlinkClick();
            } else {
                console.log("Using location.reload() to refresh the page (30% chance)");
                location.reload();
            }
        }, randomReloadTime);
    });
});
