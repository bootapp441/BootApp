document.addEventListener('DOMContentLoaded', function() {
    $(document).ready(function() {
        const buttonsHTML = `
            <center>
                <br><br>
                <span id="sellAllStampsButton" style="font-size: 10pt; background-color: #a12c13; color: white; font-weight: bold; border: 1px solid white; border-radius: 10px; padding: 5px 10px; cursor: pointer;">
                    Sell all stamps
                </span><br><br>
                <span id="sellRandomStampButton" style="font-size: 10pt; background-color: #a12c13; color: white; font-weight: bold; border: 1px solid white; border-radius: 10px; padding: 5px 10px; cursor: pointer;">
                    Sell a single random stamp
                </span><br><br>
                <span id="sellStampsCollectorPoints5Button" style="font-size: 10pt; background-color: #a12c13; color: white; font-weight: bold; border: 1px solid white; border-radius: 10px; padding: 5px 10px; cursor: pointer;">
                    Sell all stamps with collector points 5
                </span><br><br>
                <span id="sellStampsCollectorPoints40Button" style="font-size: 10pt; background-color: #a12c13; color: white; font-weight: bold; border: 1px solid white; border-radius: 10px; padding: 5px 10px; cursor: pointer;">
                    Sell all stamps with collector points 40
                </span><br><br>
                <span id="sellStampsCollectorPoints175Button" style="font-size: 10pt; background-color: #a12c13; color: white; font-weight: bold; border: 1px solid white; border-radius: 10px; padding: 5px 10px; cursor: pointer;">
                    Sell all stamps with collector points 175
                </span><br><br>
                <span id="sellStampsCollectorPoints500Button" style="font-size: 10pt; background-color: #a12c13; color: white; font-weight: bold; border: 1px solid white; border-radius: 10px; padding: 5px 10px; cursor: pointer;">
                    Sell all stamps with collector points 500
                </span><br><br>
                <span id="sellStampsCollectorPoints2000Button" style="font-size: 10pt; background-color: #a12c13; color: white; font-weight: bold; border: 1px solid white; border-radius: 10px; padding: 5px 10px; cursor: pointer;">
                    Sell all stamps with collector points 2000
                </span>
                <br><br>
            </center>
        `;

        $(buttonsHTML).insertAfter('.collector-shop');

        let isRoutineRunning = false;

        function disableAllButtons() {
            console.log("Disabling all buttons to prevent multiple executions.");
            $('button').prop('disabled', true);
        }

        function enableAllButtons() {
            console.log("Enabling all buttons after routine completes.");
            $('button').prop('disabled', false);
        }

        // Main function to handle selling stamps based on the filter
        async function sellStampsRoutine(stampFilter, singleRandom = false) {
            if (isRoutineRunning) {
                console.log("Routine is already running. Skipping new request.");
                return;
            }
            isRoutineRunning = true;
            disableAllButtons();

            try {
                const scriptContent = $('script').filter(function() {
                    return $(this).html().includes('$(".stamp-album").stampAlbum({"sets":[{"id"');
                }).html();

                if (!scriptContent) {
                    console.log("Script content not found.");
                    return;
                }

                const stepOneTrim = scriptContent.substring(47);
                const stepTwoTrim = stepOneTrim.slice(0, -9);
                const jsonData = JSON.parse(stepTwoTrim);
                console.log("Parsed JSON data:", jsonData);

                const stampAlbumSet = jsonData.sets.find(set => set.id === 8 && set.name === "Stamp Album");
                if (!stampAlbumSet) {
                    console.log("Stamp Album set with id 8 not found.");
                    return;
                }

                let stampsToFetch;
                if (singleRandom) {
                    const eligibleStamps = stampAlbumSet.stamps.filter(stamp => stamp.collected.total > 1);
                    const uniqueStamps = Array.from(new Set(eligibleStamps.map(stamp => stamp.id)))
                        .map(id => eligibleStamps.find(stamp => stamp.id === id));
                    const randomStamp = uniqueStamps[Math.floor(Math.random() * uniqueStamps.length)];
                    stampsToFetch = randomStamp ? [{
                        stamp_id: randomStamp.id.toString(),
                        amount: (randomStamp.collected.total - 1).toString()
                    }] : [];
                } else {
                    const uniqueStamps = Array.from(new Set(stampAlbumSet.stamps.map(stamp => stamp.id)))
                        .map(id => stampAlbumSet.stamps.find(stamp => stamp.id === id));

                    stampsToFetch = uniqueStamps
                        .filter(stamp => stamp.collected.total > 1 && stampFilter(stamp))
                        .map(stamp => ({
                            stamp_id: stamp.id.toString(),
                            amount: (stamp.collected.total - 1).toString()
                        }));
                }

                console.log("Unique stamps to fetch:", stampsToFetch);

                // Create a time map with cumulative delays
                const delayTimes = [];
                let cumulativeDelay = 0;

                stampsToFetch.forEach(() => {
                    const randomDelay = Math.floor(Math.random() * 4000) + 6000; 
                    cumulativeDelay += randomDelay;
                    delayTimes.push(cumulativeDelay);
                });

                // Schedule each fetch with the calculated delay
                stampsToFetch.forEach((stamp, index) => {
                    setTimeout(() => {
                        console.log(`Executing fetch for stamp ID: ${stamp.stamp_id} with a delay of ${delayTimes[index] / 1000} seconds`);
                        fetchStamp(stamp);
                    }, delayTimes[index]);
                });

                // Schedule enabling buttons after all fetches and reloading the page
                setTimeout(() => {
                    reloadPage();
                    enableAllButtons();
                    isRoutineRunning = false;
                }, cumulativeDelay + 2000); // Additional 2 seconds after the last fetch

            } catch (error) {
                console.error("Error in sellStampsRoutine:", error);
            }
        }

        // Function to execute a fetch request for a specific stamp
        async function fetchStamp(stamp) {
            const body = new URLSearchParams(stamp).toString();
            const headers = {
                "Accept": "*/*",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                "Accept-Language": "en-US,en;q=0.5",
                "Connection": "keep-alive",
                "Content-Length": body.length.toString(),
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "Host": "www.bootleggers.us",
                "Origin": "https://www.bootleggers.us",
                "Priority": "u=0",
                "Referer": "https://www.bootleggers.us/stamp-album.php",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
                "TE": "trailers",
                "User-Agent": navigator.userAgent,
                "X-Requested-With": "XMLHttpRequest"
            };

            console.log(`Fetching stamp ID: ${stamp.stamp_id} with amount: ${stamp.amount}`);
            try {
                const response = await fetch("https://www.bootleggers.us/ajax/stamps.php?action=sell-stamp", {
                    method: "POST",
                    headers: headers,
                    body: body
                });
                const data = await response.json();
                console.log(`Response for stamp ID ${stamp.stamp_id}:`, data);
            } catch (error) {
                console.error(`Error for stamp ID ${stamp.stamp_id}:`, error);
            }
        }

        function reloadPage() {
            const randomChance = Math.random();
            if (randomChance < 0.7) {
                console.log("Simulating hyperlink click to reload the page (70% chance)");
                simulateHyperlinkClick();
            } else {
                console.log("Using location.reload() to refresh the page (30% chance)");
                location.reload();
            }
        }

        function simulateHyperlinkClick() {
            const link = document.createElement("a");
            link.href = window.location.href;
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        $(document).on('click', '#sellAllStampsButton', function() {
            console.log("Sell all stamps button clicked");
            sellStampsRoutine(stamp => true);
        });

        $(document).on('click', '#sellRandomStampButton', function() {
            console.log("Sell a single random stamp button clicked");
            sellStampsRoutine(null, true);
        });

        $(document).on('click', '#sellStampsCollectorPoints5Button', function() {
            console.log("Sell all stamps with collector points 5 button clicked");
            sellStampsRoutine(stamp => stamp.collected.value.amount === 5);
        });

        $(document).on('click', '#sellStampsCollectorPoints40Button', function() {
            console.log("Sell all stamps with collector points 40 button clicked");
            sellStampsRoutine(stamp => stamp.collected.value.amount === 40);
        });

        $(document).on('click', '#sellStampsCollectorPoints175Button', function() {
            console.log("Sell all stamps with collector points 175 button clicked");
            sellStampsRoutine(stamp => stamp.collected.value.amount === 175);
        });

        $(document).on('click', '#sellStampsCollectorPoints500Button', function() {
            console.log("Sell all stamps with collector points 500 button clicked");
            sellStampsRoutine(stamp => stamp.collected.value.amount === 500);
        });

        $(document).on('click', '#sellStampsCollectorPoints2000Button', function() {
            console.log("Sell all stamps with collector points 2000 button clicked");
            sellStampsRoutine(stamp => stamp.collected.value.amount === 2000);
        });
    });
});
