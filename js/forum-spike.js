document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {

        const webhookURLnospike = localStorage.getItem('discord.webhook.8');
        const webhookURLspike = localStorage.getItem('discord.webhook.7');
        const discordEnabled = localStorage.getItem('discord.enabled') === 'true';

        let refreshScheduled = false; // Prevent duplicate scheduling in a timeslot

        // Function to get the game time offset
        function getGameTimeOffset() {
            const blTimeElement = document.querySelector('.game-time.BL-time time');
            const localTimeElement = document.querySelector('.game-time.local-time time');

            if (!blTimeElement || !localTimeElement) {
                console.warn("Game time or local time elements not found, defaulting offset to +0.");
                return 0;
            }

            const parseTimeString = (timeStr) => {
                // Example: "Fri 06:36 AM"
                const [, time, modifier] = timeStr.match(/\w+\s(\d{2}:\d{2})\s(AM|PM)/) || [];
                let [hours, minutes] = time.split(':').map(Number);
                if (modifier === 'PM' && hours !== 12) hours += 12;
                if (modifier === 'AM' && hours === 12) hours = 0;
                return { hours, minutes };
            };

            const blTime = parseTimeString(blTimeElement.textContent.trim());
            const localTime = parseTimeString(localTimeElement.textContent.trim());

            const blDate = new Date();
            blDate.setHours(blTime.hours, blTime.minutes, 0, 0);

            const localDate = new Date();
            localDate.setHours(localTime.hours, localTime.minutes, 0, 0);

            const offsetMs = blDate - localDate;
            const offsetHours = offsetMs / (1000 * 60 * 60);
            console.log(`Calculated offset between BL Time and local time: ${offsetHours} hours`);
            return offsetHours;
        }

        // Function to determine the current timeslot and its bounds
        function getTimeSlotBounds() {
            console.log("Determining current timeslot...");
            const now = new Date();
            const currentMinutes = now.getMinutes();
            const slotStart = new Date(now);
            const slotEnd = new Date(now);

            if (currentMinutes >= 0 && currentMinutes < 20) {
                slotStart.setMinutes(0, 0, 0);
                slotEnd.setMinutes(20, 0, 0);
                console.log("Current timeslot: 0-20");
                return { slotStart, slotEnd, label: "0-20" };
            }
            if (currentMinutes >= 20 && currentMinutes < 40) {
                slotStart.setMinutes(20, 0, 0);
                slotEnd.setMinutes(40, 0, 0);
                console.log("Current timeslot: 20-40");
                return { slotStart, slotEnd, label: "20-40" };
            }
            slotStart.setMinutes(40, 0, 0);
            slotEnd.setMinutes(0, 0, 0);
            slotEnd.setHours(now.getHours() + 1); // Next hour's 0 minutes
            console.log("Current timeslot: 40-0");
            return { slotStart, slotEnd, label: "40-0" };
        }

        // Function to simulate hyperlink click
        function simulateHyperlinkClick() {
            console.log("Attempting to simulate a hyperlink click...");
            const targetURL = "https://www.bootleggers.us/forum_new/index.php?flag=1&goto=616827";

            const randomChance = Math.random();
            if (randomChance < 0.7) {
                console.log(`70% chance triggered: Simulating navigation to target URL: ${targetURL}`);
                window.location.href = targetURL;
            } else {
                console.log("30% chance triggered: Reloading page using location.reload().");
                location.reload();
            }
        }

        // Function to schedule a randomized refresh in specific minute slots
        function scheduleRandomRefresh() {
            const now = new Date();
            const minute = now.getMinutes();
            console.log(`Checking for scheduled refresh at minute: ${minute}`);

            // Target minute ranges
            if ((minute >= 4 && minute <= 6) || (minute >= 10 && minute <= 12) || (minute >= 24 && minute <= 26) || (minute >= 30 && minute <= 32) || (minute >= 44 && minute <= 46) || (minute >= 50 && minute <= 52)) {
                if (!refreshScheduled) {
                    refreshScheduled = true;

                    // Randomize the delay within 0-120 seconds (2 minutes)
                    const randomDelay = Math.floor(Math.random() * 120000);
                    console.log(`Randomized refresh scheduled in ${randomDelay / 1000} seconds.`);

                    setTimeout(() => {
                        const randomChance = Math.random();
                        if (randomChance < 0.7) {
                            console.log("70% chance triggered: Simulating hyperlink click.");
                            simulateHyperlinkClick();
                        } else {
                            console.log("30% chance triggered: Reloading page using location.reload().");
                            location.reload();
                        }
                        refreshScheduled = false; // Reset for the next timeslot
                    }, randomDelay);
                } else {
                    console.log("Refresh already scheduled for this timeslot.");
                }
            } else {
                refreshScheduled = false;
                console.log("Not within refresh slots (12-14, 32-34, 52-54). Skipping refresh.");
            }
        }

        // Function to process posts in the iframe
        function processIframePosts() {
            console.log("Processing posts inside the iframe...");
            const iframe = document.querySelector('#repliesFrame');

            if (iframe && iframe.contentDocument) {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                console.log("Iframe content successfully accessed.");

                const posts = iframeDoc.querySelectorAll('table.sub2.centered.forum-post.reply');
                console.log(`Found ${posts.length} posts to process.`);

                const { slotStart, slotEnd, label } = getTimeSlotBounds();
                let sendDelay = 0;

                posts.forEach((post) => {
                    const postID = post.getAttribute("data-id");
                    console.log(`Processing post ID: ${postID}`);

                    const timeElement = post.querySelector("time.date-posted");
                    const contentElement = post.querySelector("td.post-container .contents");
                    const contentText = contentElement ? contentElement.textContent.trim() : "";
                    const images = contentElement.querySelectorAll("img");

                    if (images.length > 0 && contentText === "") {
                        console.log(`Skipping post ID: ${postID} (only images found).`);
                        return;
                    }

                    if (timeElement) {
                        let postTime = new Date(timeElement.getAttribute("datetime"));

                        console.log(`Timestamp before adjustment: ${postTime}`);
                        // postTime.setHours(postTime.getHours() + 6);
                        const blOffset = getGameTimeOffset();
                        postTime.setHours(postTime.getHours() + blOffset);
                        console.log(`Timestamp after adjustment: ${postTime}`);

                        // Adjust postTime for testing purposes if postID is xxx
                        // if (postID === "2270780") {
                        //    const now = new Date(); // Current time
                        //    postTime = new Date(now.getTime() - 60000); // Subtract 1 minute (60,000 ms)
                        //    console.log(`Test override: Post ID ${postID} time adjusted to ${postTime}`);
                        // } 

                        if (postTime >= slotStart && postTime < slotEnd) {
                            console.log(`Post ID ${postID} is within the current timeslot (${label}).`);
                            if (!isPostAlreadySent(postID, label)) {
                                console.log(`Sending post ID ${postID} to Discord...`);
                                setTimeout(() => {
                                    if (discordEnabled && webhookURLnospike) {
                                        sendToDiscord(webhookURLnospike, postID, post.querySelector("b")?.textContent, postTime, contentText);
                                    }
                                    if (discordEnabled && webhookURLspike) {
                                        sendToDiscord(webhookURLspike, postID, post.querySelector("b")?.textContent, postTime, contentText);
                                    }

                                    markPostAsSent(postID, label);
                                }, sendDelay);
                                sendDelay += 2000; // Throttle 2 seconds
                            } else {
                                console.log(`Post ID ${postID} already sent. Skipping.`);
                            }
                        } else {
                            console.log(`Post ID ${postID} is outside the current timeslot (${label}). Skipping.`);
                        }
                    }
                });
            } else {
                console.log("Iframe not accessible. Ensure the iframe ID is correct.");
            }
        }

        // Ensure iframe is fully loaded before processing
        const iframe = document.querySelector('#repliesFrame');
        if (iframe) {
            iframe.addEventListener('load', function () {
                console.log("Iframe fully loaded. Starting post processing...");
                processIframePosts();
            });
        } else {
            console.error("Iframe with ID 'repliesFrame' not found.");
        }

        function cleanContent(input) {
            // Replace multiple newlines with a single space
            let cleaned = input.replace(/\n+/g, ' ');

            // Add a space between concatenated words (e.g., testTest -> test Test)
            // cleaned = cleaned.replace(/([a-zA-Z])([A-Z])/g, '$1 $2');

            // Replace multiple spaces with a single space and trim
            cleaned = cleaned.replace(/\s+/g, ' ').trim();

            return cleaned;
        }

        // Send post data to Discord
        async function sendToDiscord(webhookURL, postID, user, time, content) {
            console.log(`Sending post ID ${postID} to webhook: ${webhookURL}`);

            // Clean up content before sending
            const cleanedContent = cleanContent(content);

            // Calculate the minutes
            const date = new Date();
            let min = date.getMinutes();

            // Adjust timeLeft based on regular time slots (00-19, 20-39, 40-59)
            var timeLeft = 0;
            var currentSlot = 0;

            if (min < 20) {
                timeLeft = 20 - min;
                currentSlot = 0;  // 00:00 to 19:59
            } else if (min < 40) {
                timeLeft = 40 - min;
                currentSlot = 1;  // 20:00 to 39:59
            } else if (min < 60) {
                timeLeft = 60 - min;
                currentSlot = 2;  // 40:00 to 59:59
            }

            const payload = {
                content: '',
                embeds: [
                    {
                        // description: `**ForumSpike (${getTimeSlotBounds().label}):**\n\n**User**: ${user}\n**Time**: ${time}\n**Content**: ${content}`,
                        description: `${cleanedContent} -- **${timeLeft} minutes** left. (${user})`,
                        color: 5763719
                    }
                ]
            };

            await fetch(webhookURL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            console.log(`Post ID ${postID} successfully sent.`);
        }

        // Check and mark sent posts in localStorage
        function isPostAlreadySent(postID, timeslot) {
            console.log(`Checking if post ID ${postID} was already sent for timeslot ${timeslot}.`);
            const sentPosts = JSON.parse(localStorage.getItem('sentPosts') || '{}');
            return sentPosts[timeslot]?.includes(postID);
        }

        function markPostAsSent(postID, timeslot) {
            console.log(`Marking post ID ${postID} as sent for timeslot ${timeslot}.`);
            const sentPosts = JSON.parse(localStorage.getItem('sentPosts') || '{}');
            if (!sentPosts[timeslot]) sentPosts[timeslot] = [];
            sentPosts[timeslot].push(postID);
            localStorage.setItem('sentPosts', JSON.stringify(sentPosts));
        }

        // Schedule page refresh checks every 30 seconds
        console.log("Scheduling random refresh checks every 30 seconds.");
        setInterval(scheduleRandomRefresh, 75000);

        // Process posts when the page loads
        console.log("Starting to process iframe posts...");
        processIframePosts();
    });
});
