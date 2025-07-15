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
            if (firstRow && !document.querySelector('#autoBustButton300crewonly')) {
                const newRow = document.createElement('tr'); // Create a new row
                newRow.innerHTML = `
                        <br>      
                        <span id="autoBustButton300crewonly" style="
                            font-size: 7pt; 
                            background-color:rgb(80, 43, 35); 
                            color: white; 
                            font-weight: bold; 
                            border: 1px solid white; 
                            border-radius: 10px; 
                            padding: 3px 6px; 
                            cursor: pointer;
                        ">
                            300 | Crew Only
                        </span>
                `;

                // Append the new row below the first row
                firstRow.parentNode.insertBefore(newRow, firstRow.nextSibling);

                // Add click event to the button
                const button = document.querySelector('#autoBustButton300crewonly');
                button.addEventListener('click', () => {
                    autoBustActive = true;
                    console.log('AutoBust mode activated!');
                    startAutoBust(leavenworthTable);
                });
            }

            // Check if AutoBust should resume
            if (localStorage.getItem('resumeAutoBust300crewonly') === 'true') {
                console.log('Resuming AutoBust after reload...');
                localStorage.removeItem('resumeAutoBust300crewonly'); // Clear the state
                const autoBustButton = document.querySelector('#autoBustButton300crewonly');
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
                localStorage.setItem('resumeAutoBust300crewonly', 'true'); // Store state to resume AutoBust
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
                }, 300);
                return;
            } else {
                setTimeout(() => {
                    const refreshIcon = leavenworthTable.querySelector('.ui-icon.icon-refresh > div');
                    refreshIcon.click();
                }, 300);
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
                setTimeout(() => startAutoBust(updatedTable), Math.random() * 300 + 300);
            }, 300); // Wait for table refresh
        }
    });
});
