document.addEventListener('DOMContentLoaded', async function () {
    $(document).ready(async function () {

        const webhookUrl = localStorage.getItem('discord.webhook.1');
        const discordEnabled = localStorage.getItem('discord.enabled') === 'true';

        // const categories = ["Car Type", "Booze Type", "Capacity", "Amount", "Location", "Garaged"];
        const filteredConditions = {
            "Rocky Mount": ["Moonshine"],
            "Detroit": ["Whiskey"],
            "Chicago": ["Whiskey", "Beer"],
            "Cincinnati": ["Bourbon"],
            "New York City": ["Gin", "Beer"],
            "Atlantic City": ["Gin"],
            "New Orleans": ["Bourbon", "Rum"]
        };
        const delayTime = 1000;
        const delayTimeShort = 50;

        async function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        // Open Car Page
        async function openCarPage() {
            const carButton = document.querySelector('.main-controls .buttons-box .icon-cars');
            if (carButton) {
                carButton.click();
                console.log("Car page navigation triggered.");
                await delay(delayTime);

                for (let i = 0; i < 5; i++) {
                    if ($('.cars-listing .car').length > 0) {
                        console.log("Car page successfully loaded.");
                        return true;
                    }
                    await delay(1000);
                }
                console.error("Failed to load car page.");
            } else {
                console.error("Car button not found.");
            }
            return false;
        }

        // Filter Cars for All States
        async function filterCarsAllStates() {
            const filterControls = document.querySelector('.filter-controls');

            if (filterControls) {
                const cityFilterDropdown = filterControls.querySelector('.city-filter');

                if (cityFilterDropdown) {
                    const optionToSelect = Array.from(cityFilterDropdown.options).find(option => option.value === '0');
                    if (optionToSelect) {
                        cityFilterDropdown.value = '0';
                        optionToSelect.selected = true;
                        cityFilterDropdown.dispatchEvent(new Event('change', { bubbles: true }));
                        console.log("Filtered cars for all states.");
                        await delay(1500);
                    }
                }
            }
        }

        // Extract Car Data and Clean Location
        function extractCarData() {
            const rawLocation = $('.location-description').text().trim();
            const cleanedLocation = rawLocation.replace(/\sin\s\d{2}:\d{2}:\d{2}/, ""); // Remove 'in 00:00:00'
            const boozeType = $('.booze-name').text().trim() || "N/A";
            return {
                "Car Type": $('.car-name').text().trim(),
                "Booze Type": boozeType === "N/A" ? "" : boozeType,
                "Capacity": parseInt($('.booze-capacity-box .label').text().split('/')[1]?.trim()) || 0,
                "Amount": boozeType ? parseInt($('.booze-crates .crates').text().replace(/[^0-9]/g, '')) || 0 : "",
                "Location": cleanedLocation
            };
        }

        let trunkOpened = false; // Flag to ensure trunk opens only once

        async function processCarsOnPage() {
            const carDataList = [];
            const totalCars = $('.cars-listing .car').length;

            console.log(`Found ${totalCars} cars on this page.`);

            const firstCar = $('.cars-listing .car').first();
            firstCar.find('.main-side').trigger('click');
            await delay(delayTime);

            // Open trunk for the first car ONLY on the first page
            if (!trunkOpened) {
                $('.trunk-button').first().trigger('click');
                await delay(delayTime);
                console.log("Trunk opened for the first car.");
                trunkOpened = true; // Set the flag to true
            }

            // Navigate cars using the right arrow
            for (let i = 0; i < totalCars; i++) {
                const carData = extractCarData();
                carDataList.push(carData);
                console.log(`Processed car ${i + 1}:`, carData);

                if (i < totalCars - 1) {
                    $('.BL-wide-arrow.arrow-right.next-car').children('div').trigger('click');
                    await delay(delayTimeShort);
                }
            }

            // Go back to car list
            $('.panel-top .go-back').trigger('click');
            await delay(delayTime);
            console.log("Returned to car list.");
            return carDataList;
        }

        // Check for Next Page
        function hasNextPage() {
            const currentPageText = $('.current-page').text().trim();
            const match = currentPageText.match(/Page (\d+) of (\d+)/);

            if (match) {
                const currentPage = parseInt(match[1]);
                const totalPages = parseInt(match[2]);
                return currentPage < totalPages;
            }
            return false;
        }

        // Process All Pages
        async function processAllPages() {
            let allCarData = [];
            let currentPage = 1;

            do {
                console.log(`Processing page ${currentPage}...`);
                const carDataOnPage = await processCarsOnPage();
                allCarData = allCarData.concat(carDataOnPage);

                if (hasNextPage()) {
                    $('.next-button.page-button').trigger('click');
                    await delay(2000);
                    currentPage++;
                } else {
                    console.log("No more pages to process.");
                    break;
                }
            } while (true);

            return allCarData;
        }

        // Group cars by cleaned location
        function groupCarsByLocation(carDataArray) {
            return carDataArray.reduce((groups, car) => {
                const location = car["Location"] || "Unknown";
                if (!groups[location]) {
                    groups[location] = [];
                }
                groups[location].push(car);
                return groups;
            }, {});
        }

        function buildMarkdownTable(carGroup) {
            // Only include required categories
            const categories = ["Car Type", "Booze Type", "Capacity", "Amount"];

            // Group duplicate cars with counts
            const carCounts = {};
            carGroup.forEach(car => {
                const boozeType = car["Booze Type"] || ""; // Include cars without booze
                const amount = boozeType ? car["Amount"] : ""; // No amount if no booze
                const key = `${car["Car Type"]} | ${boozeType} | ${car["Capacity"]} | ${amount}`;

                if (!carCounts[key]) carCounts[key] = { count: 0, data: { ...car, "Booze Type": boozeType, "Amount": amount } };
                carCounts[key].count += 1;
            });

            // Convert to array and sort by Booze Type, Capacity, and Amount
            const carEntries = Object.keys(carCounts)
                .map(key => ({ ...carCounts[key].data, Count: carCounts[key].count }))
                .sort((a, b) => {
                    const boozeA = a["Booze Type"] || "";
                    const boozeB = b["Booze Type"] || "";

                    if (boozeA !== boozeB) return boozeA.localeCompare(boozeB); // Sort alphabetically by Booze Type
                    if (a.Capacity !== b.Capacity) return b.Capacity - a.Capacity; // Sort by capacity descending
                    if ((a.Amount || 0) !== (b.Amount || 0)) return (b.Amount || 0) - (a.Amount || 0); // Sort by amount descending
                    return 0;
                });

            // Determine column widths dynamically
            const columnWidths = ["Count", ...categories].map(category =>
                Math.max(...carEntries.map(car => String(car[category] || "").length), category.length)
            );

            const pad = (str, len) => String(str).padEnd(len, " ");

            // Build table header
            let markdown = `| ${["Count", ...categories].map((cat, i) => pad(cat, columnWidths[i])).join(" | ")} |\n`;
            markdown += `| ${columnWidths.map(len => "-".repeat(len)).join(" | ")} |\n`;

            // Populate table rows
            carEntries.forEach(car => {
                const row = ["Count", ...categories].map((cat, i) => pad(car[cat] || "", columnWidths[i])).join(" | ");
                markdown += `| ${row} |\n`;
            });

            return markdown;
        }

        async function sendGroupedDataToDiscord(carDataArray) {
            if (!discordEnabled || !webhookUrl) {
                console.warn("Discord integration is disabled or webhook URL is missing.");
                return;
            }

            const groupedData = groupCarsByLocation(carDataArray);

            for (const [location, carGroup] of Object.entries(groupedData)) {
                const markdownTable = buildMarkdownTable(carGroup);
                const baseMessage = `**Cars in ${location}**\n\`\`\`\n`;
                const rows = markdownTable.split('\n');
                let currentMessage = baseMessage;

                // Split messages dynamically based on 2000-character limit
                for (const row of rows) {
                    if ((currentMessage + row + '\n```').length <= 2000) {
                        currentMessage += row + '\n';
                    } else {
                        currentMessage += '```\n'; // Close the previous message
                        await fetch(webhookUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ content: currentMessage })
                        });
                        console.log(`Sent part of data for ${location} to Discord.`);

                        // Start a new message with proper Markdown formatting
                        currentMessage = `**Cars in ${location} (continued)**\n\`\`\`\n${row}\n`;
                    }
                }

                // Send any remaining message
                if (currentMessage.trim() !== baseMessage) {
                    currentMessage += '```\n';
                    await fetch(webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: currentMessage })
                    });
                    console.log(`Sent final part of data for ${location} to Discord.`);
                }

                await delay(1000); // Avoid rate limits
            }

            // Send final stats summary
            const statsMessage = generateFinalStats(carDataArray);
            const statsMessages = splitMessage(statsMessage, 2000);

            for (const part of statsMessages) {
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: part })
                });
                console.log("Sent part of final stats summary to Discord.");
            }
        }

        // Helper function to split long messages
        function splitMessage(message, maxLength) {
            const parts = [];
            const lines = message.split('\n');
            let currentPart = '';

            for (const line of lines) {
                if ((currentPart + line + '\n').length <= maxLength) {
                    currentPart += line + '\n';
                } else {
                    parts.push(currentPart.trim());
                    currentPart = line + '\n';
                }
            }

            if (currentPart.trim()) {
                parts.push(currentPart.trim());
            }

            return parts;
        }

        function generateFinalStats(carDataArray) {
            const targetCars = ["School Bus", "Milk Truck", "Hearse", "Porter Model 1 Closed Cab"];
            const totals = {};
            const emptyLargeCars = {};
            let totalCapacity = 0;
            let totalFilled = 0;

            // Initialize totals and empty counters
            targetCars.forEach(carType => {
                totals[carType] = 0;
                emptyLargeCars[carType] = 0;
            });

            // Process car data
            carDataArray.forEach(car => {
                const carType = car["Car Type"];
                const capacity = car["Capacity"];
                const amount = car["Amount"];

                if (targetCars.includes(carType)) {
                    // Count total number of cars
                    totals[carType] += 1;

                    // Count empty cars
                    if (capacity >= 1500 && amount === 0) {
                        emptyLargeCars[carType] += 1;
                    }

                    // Calculate total filled capacity
                    if (["School Bus", "Milk Truck", "Hearse", "Porter Model 1 Closed Cab"].includes(carType)) {
                        totalCapacity += capacity;
                        totalFilled += amount;
                    }
                }
            });

            // Calculate filled percentage
            const filledPercentage = totalCapacity > 0 ? Math.ceil((totalFilled / totalCapacity) * 100) : 0;

            // Generate Right State Capacity Overview
            const rightStateCapacityMessage = generateRightStateCapacity(carDataArray);

            // Build the final stats message
            let finalMessage = "**Final Stats Summary**\n\n";

            // Total number of large-capacity cars
            finalMessage += `**Total large-capacity cars:**\n`;
            finalMessage += "```\n";
            targetCars.forEach(carType => {
                finalMessage += `${carType.padEnd(27)}: ${String(totals[carType]).padStart(5)}\n`;
            });
            finalMessage += "```\n";

            // Total filled capacity percentage
            finalMessage += `**Overview of Total Filled Capacity (All Large Cars):**\n`;
            finalMessage += "```\n";
            finalMessage += `Total Capacity: ${totalCapacity} crates\n`;
            finalMessage += `Filled Capacity: ${totalFilled} crates\n`;
            finalMessage += `Filled Percentage: ${filledPercentage}%\n`;
            finalMessage += "```\n";

            // Overview of Filled in the Right State Capacity
            finalMessage += rightStateCapacityMessage;

            // Total number of empty large-capacity cars
            const column1Width = Math.max(...targetCars.map(car => car.length), "Car Type".length);
            const column2Width = "Empty Cars".length;

            finalMessage += `**Number of Empty Large-Capacity Cars:**\n`;
            finalMessage += "```\n";
            finalMessage += `| ${"Car Type".padEnd(column1Width)} | ${"Empty Cars".padStart(column2Width)} |\n`;
            finalMessage += `| ${"-".repeat(column1Width)} | ${"-".repeat(column2Width)} |\n`;

            targetCars.forEach(carType => {
                finalMessage += `| ${carType.padEnd(column1Width)} | ${String(emptyLargeCars[carType]).padStart(column2Width)} |\n`;
            });
            finalMessage += "```\n";

            return finalMessage;
        }

        function generateRightStateCapacity(carDataArray) {
            let totalRightCapacity = 0;
            let totalRightFilled = 0;
            let rightCarCount = 0;
            let totalWrongCapacity = 0;
            let totalWrongFilled = 0;
            let wrongCarCount = 0;

            carDataArray.forEach(car => {
                const location = car["Location"];
                const boozeType = car["Booze Type"];
                const capacity = car["Capacity"];
                const amount = car["Amount"];

                if (capacity > 2000 && amount > 0) { // Only count cars with >2000 capacity and filled
                    if (!(filteredConditions[location] && filteredConditions[location].includes(boozeType))) {
                        // Right state
                        totalRightCapacity += capacity;
                        totalRightFilled += amount;
                        rightCarCount += 1;
                    } else {
                        // Wrong state
                        totalWrongCapacity += capacity;
                        totalWrongFilled += amount;
                        wrongCarCount += 1;
                    }
                }
            });

            // Calculate filled percentages
            const rightFilledPercentage = totalRightCapacity > 0 ? Math.ceil((totalRightFilled / totalRightCapacity) * 100) : 0;
            const wrongFilledPercentage = totalWrongCapacity > 0 ? Math.ceil((totalWrongFilled / totalWrongCapacity) * 100) : 0;

            let message = "**Overview of Filled in the Right State (>2000 Cap):**\n";
            message += "```\n";
            message += `Total Capacity: ${totalRightCapacity} crates\n`;
            message += `Filled Capacity: ${totalRightFilled} crates\n`;
            message += `Filled Percentage: ${rightFilledPercentage}%\n`;
            message += `Cars in Right State: ${rightCarCount}/${rightCarCount + wrongCarCount}\n`;
            message += "```\n";

            message += "**Overview of Filled in the Wrong State (>2000 Cap):**\n";
            message += "```\n";
            message += `Total Capacity: ${totalWrongCapacity} crates\n`;
            message += `Filled Capacity: ${totalWrongFilled} crates\n`;
            message += `Filled Percentage: ${wrongFilledPercentage}%\n`;
            message += `Cars to be moved to Right State: ${wrongCarCount}/${rightCarCount + wrongCarCount}\n`;
            message += "```\n";

            return message;
        }

        // Main Routine
        async function main() {
            console.log("Starting car data collection routine...");
            const carPageLoaded = await openCarPage();
            if (!carPageLoaded) return;

            await filterCarsAllStates(); // Filter for all cities

            const allCarData = await processAllPages();
            const markdownMessage = buildMarkdownTable(allCarData);
            console.log("Final Markdown Table:\n", markdownMessage);

            const statsMessage = generateFinalStats(allCarData);
            await sendGroupedDataToDiscord(allCarData); // Send detailed tables

            $('.icon-close.main').trigger('click');
        }

        $('.car-markdown').click(main);
    });
});
