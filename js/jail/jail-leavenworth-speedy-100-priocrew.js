document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {        
        /* ======== CAPTCHA CHECK HELPDER SCRIPTS ======== */
        function isCaptchaActive() {
            const solving = localStorage.getItem('captcha.solving') === 'true';
            const solvingSince = parseInt(localStorage.getItem('captcha.solvingStartedAt') || '0', 10);
            const solvedAt = parseInt(localStorage.getItem('captcha.solvedAt') || '0', 10);
            const blockDuration = parseInt(localStorage.getItem('captcha.blockDuration') || '120000', 10);
            const now = Date.now();
        
            // If solving started recently, we block actions
            if (solvingSince && (now - solvingSince < blockDuration)) {
                return true;
            }
        
            // If solving was completed recently, still block actions temporarily
            if (solvedAt && (now - solvedAt < blockDuration)) {
                return true;
            }
        
            return false;
        }

        function handleCaptchaDetected() {
            if (!isCaptchaActive()) return;
            console.log("[Captcha] Detected, clicks paused until solved.");
        }

        // Function to extract the username from the page
        function getUsername() {
            const usernameDiv = document.querySelector('.character-container .username a');
            return usernameDiv ? usernameDiv.textContent.trim() : 'unknown';
        }

        let autoBustActive = false;

        const leavenworthTable = document.querySelector('.jail-table.block-table');
        // console.log("Detected 'Leavenworth Penitentiary' table.");
        addAutoBustButton(leavenworthTable); // Add AutoBust button

        function addAutoBustButton(leavenworthTable) {
            // Locate the first row of the Leavenworth Penitentiary table
            const firstRow = leavenworthTable.querySelector('tr');
            if (firstRow && !document.querySelector('#autoBustButton100crew')) {
                const newRow = document.createElement('tr'); // Create a new row
                newRow.innerHTML = `
                        <br>
                        <span id="autoBustButton100crew" style="
                            font-size: 7pt; 
                            background-color:rgb(80, 43, 35); 
                            color: white; 
                            font-weight: bold; 
                            border: 1px solid white; 
                            border-radius: 10px; 
                            padding: 3px 6px; 
                            cursor: pointer;
                        ">
                            100 | Crew > PartyHost > 100k+ > Rest
                        </span>
                `;
        
                // Append the new row below the first row
                firstRow.parentNode.insertBefore(newRow, firstRow.nextSibling);
        
                // Add click event to the button
                const button = document.querySelector('#autoBustButton100crew');
                button.addEventListener('click', () => {
                    autoBustActive = true;
                    console.log('AutoBust mode activated!');
                    startAutoBust(leavenworthTable);
                });
            }

            // Check if AutoBust should resume
            if (localStorage.getItem('resumeAutoBust100crew') === 'true') {
                console.log('Resuming AutoBust after reload...');
                localStorage.removeItem('resumeAutoBust100crew'); // Clear the state
                const autoBustButton = document.querySelector('#autoBustButton100crew');
                if (autoBustButton) {
                    autoBustButton.click(); // Simulate button click
                } else {
                    console.log('AutoBust button not found. Cannot resume.');
                }
            }
        }

        function startAutoBust(leavenworthTable) {
            const username = getUsername();
            const userInJail = Array.from(leavenworthTable.querySelectorAll('.inmates .inmate')).some(inmate => {
                const player = inmate.querySelector('.BL-player');
                return player && player.dataset.username === username;
            });
        
            const updatedTable = document.querySelector('.jail-table.block-table');
            
            // captcha check
            if (isCaptchaActive()) { 
                localStorage.setItem('autoBustButton100crew', 'true'); // Store state to resume AutoBust
                handleCaptchaDetected(); 
                return;
            }


            if (userInJail) {
                // console.log('Username is in jail. Temporarily stopping AutoBust.');
                // Schedule the next AutoBust attempt
                setTimeout(() => {
                    const userInmate = Array.from(leavenworthTable.querySelectorAll('.inmates .inmate')).find(inmate => {
                        const player = inmate.querySelector('.BL-player');
                        return player && player.dataset.username === username;
                    });
        
                    if (userInmate) {
                        const bustOutDiv = userInmate.querySelector('.bust-container .bust-link');
                        const securityLevel = userInmate.dataset.securityLevel;
        
                        if (bustOutDiv && securityLevel === "1") {
                            console.log("Performing self bust...");
                            bustOutDiv.click();
                        }
                    }
                    startAutoBust(updatedTable);
                }, 100); 
                return;
            } else {
                setTimeout(() => {
                    const refreshIcon = leavenworthTable.querySelector('.ui-icon.icon-refresh > div');
                    refreshIcon.click();   
                }, 100); 
            }
                            
            setTimeout(() => {
                const inmates = Array.from(updatedTable.querySelectorAll('.inmates .inmate'));
            
                // First priority: Check for specific usernames "Player1" or "Player2"
                let targetInmate = inmates.find(inmate => {
                    const player = inmate.querySelector('.BL-player');
                    return player && player.dataset.username !== username &&
                        (player.dataset.username === "Player1" || player.dataset.username === "Player2" || player.dataset.username === "Player3");
                });
            
                // If no party-host inmate, prioritize "CrewA" inmates
                if (!targetInmate) {
                    targetInmate = inmates.find(inmate => {
                        const player = inmate.querySelector('.BL-player');
                        const crewMember = inmate.querySelector('.BL-crew-button[title="CrewA"]');
                        return crewMember && player && player.dataset.username !== username;
                    });
                }

                // Prioritize party-host inmates
                if (!targetInmate) {
                    targetInmate = inmates.find(inmate => {
                        const player = inmate.querySelector('.BL-player');
                        return inmate.classList.contains('party-host') && player && player.dataset.username !== username;
                    });
                }

                // Prioritize inmates with a bust reward of $100,000 or more
                if (!targetInmate) {
                    targetInmate = inmates.find(inmate => {
                        const rewardElement = inmate.querySelector('.bust-reward'); // Adjust selector based on reward element
                        const player = inmate.querySelector('.BL-player'); // Find the player info
                        if (!rewardElement || !player) return false;

                        const rewardText = rewardElement.textContent.trim();
                        const rewardValue = parseReward(rewardText);

                        // Exclude current user and other specific usernames
                        return player && player.dataset.username !== username && rewardValue >= 100000 ;
                    });
                }

                // If no "CrewA" inmate, fallback to all others by security level
                if (!targetInmate) {
                    targetInmate = inmates.find(inmate => {
                        const player = inmate.querySelector('.BL-player');
                        const securityLevel = inmate.dataset.securityLevel;
                        return player && player.dataset.username !== username && securityLevel === "0";
                    });
                }
            
                // If no level "0" inmate, fallback to level "1"
                if (!targetInmate) {
                    targetInmate = inmates.find(inmate => {
                        const player = inmate.querySelector('.BL-player');
                        const securityLevel = inmate.dataset.securityLevel;
                        return player && player.dataset.username !== username && securityLevel === "1";
                    });
                }
            
                // If no level "1" inmate, fallback to level "2"
                if (!targetInmate) {
                    targetInmate = inmates.find(inmate => {
                        const player = inmate.querySelector('.BL-player');
                        const securityLevel = inmate.dataset.securityLevel;
                        return player && player.dataset.username !== username && securityLevel === "2";
                    });
                }
            
                // If no level "2" inmate, fallback to level "3"
                if (!targetInmate) {
                    targetInmate = inmates.find(inmate => {
                        const player = inmate.querySelector('.BL-player');
                        const securityLevel = inmate.dataset.securityLevel;
                        return player && player.dataset.username !== username && player.dataset.username !== "CharlesMcCown" && securityLevel === "3";
                    });
                }
            
                if (targetInmate) {
                    const bustLink = targetInmate.querySelector('.bust-container .bust-link');
                    const inmateName = targetInmate.querySelector('.BL-player').dataset.username;
                    const securityLevel = targetInmate.dataset.securityLevel;
            
                    if (bustLink) {
                        console.log(`Attempting to bust out: ${inmateName} (Security Level: ${securityLevel})`);
                        bustLink.click();
                    } else {
                        console.log(`No bust link available for: ${inmateName} (Security Level: ${securityLevel}).`);
                    }
                } else {
                    console.log('No suitable inmates found to bust.');
                }
        
                // Schedule the next AutoBust attempt
                setTimeout(() => startAutoBust(updatedTable), Math.random() * 100 + 100); // 6-14 seconds
            }, 100); // Wait for table refresh
        }
        
        // Helper function to parse reward text
        function parseReward(rewardText) {
            if (!rewardText) return 0;

            // Remove $ sign and trim whitespace
            rewardText = rewardText.replace('$', '').trim();

            // Determine multiplier based on the suffix
            const suffix = rewardText.slice(-1).toLowerCase();
            const multipliers = {
                b: 1_000_000_000, // Billions
                m: 1_000_000,     // Millions
                k: 1_000          // Thousands
            };

            if (suffix in multipliers) {
                return parseFloat(rewardText.slice(0, -1)) * multipliers[suffix];
            }

            // Return numeric value for plain numbers
            return parseFloat(rewardText);
        }
    });
});
