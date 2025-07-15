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
        addAutoBustButton(leavenworthTable); // Add AutoBust button

        function addAutoBustButton(leavenworthTable) {
            const firstRow = leavenworthTable.querySelector('tr');
            if (firstRow && !document.querySelector('#autoBustButton100ccrandom')) {
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                        <br>
                        <span id="autoBustButton100ccrandom" style="
                            font-size: 7pt; 
                            background-color:rgb(80, 43, 35); 
                            color: white; 
                            font-weight: bold; 
                            border: 1px solid white; 
                            border-radius: 10px; 
                            padding: 3px 6px; 
                            cursor: pointer;
                        ">
                            100 | Cotton Candy mode [random, leave 2]
                        </span>
                `;
                firstRow.parentNode.insertBefore(newRow, firstRow.nextSibling);

                const button = document.querySelector('#autoBustButton100ccrandom');
                button.addEventListener('click', () => {
                    autoBustActive = true;
                    console.log('AutoBust mode activated!');
                    startAutoBust(leavenworthTable);
                });
            }

            if (localStorage.getItem('resumeAutoBust100ccrandom') === 'true') {
                console.log('Resuming AutoBust after reload...');
                localStorage.removeItem('resumeAutoBust100ccrandom');
                const autoBustButton = document.querySelector('#autoBustButton100ccrandom');
                if (autoBustButton) {
                    autoBustButton.click();
                } else {
                    console.log('AutoBust button not found. Cannot resume.');
                }
            }
        }

        function startAutoBust(leavenworthTable) {
            const username = getUsername();
            const excludedInmate = "CharlesMcCown"; // Inmate to always exclude
                       
            const userInJail = Array.from(leavenworthTable.querySelectorAll('.inmates .inmate')).some(inmate => {
                const player = inmate.querySelector('.BL-player');
                return player && player.dataset.username === username;
            });
        
            const updatedTable = document.querySelector('.jail-table.block-table');
            
            // captcha check
            if (isCaptchaActive()) { 
                localStorage.setItem('resumeAutoBust100ccrandom', 'true'); // Store state to resume AutoBust
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
                setTimeout(() => {
                    const refreshIcon = leavenworthTable.querySelector('.ui-icon.icon-refresh > div');
                    refreshIcon.click();   
                }, 100); 

                const inmates = Array.from(updatedTable.querySelectorAll('.inmates .inmate'));

                // Remove excluded inmate and all party-host inmates from the list
                const filteredInmates = inmates.filter(inmate => {
                    const player = inmate.querySelector('.BL-player');
                    return (
                        player && 
                        player.dataset.username !== excludedInmate &&
                        !inmate.classList.contains('party-host') // Filter out party-host inmates
                    );
                });

                // Skip if fewer than 3 filtered inmates remain
                if (inmates.length < 3) {
                    // console.log(`Fewer than 3 eligible inmates (${filteredInmates.length}). Skipping bust and rechecking.`);
                    setTimeout(() => startAutoBust(updatedTable), Math.random() * 100 + 100);
                    return;
                }

                let targetInmate = filteredInmates.find(inmate => {
                    const player = inmate.querySelector('.BL-player');
                    return player && player.dataset.username !== username &&
                        (player.dataset.username === "Player1" || player.dataset.username === "Player2" || player.dataset.username === "Player3");
                });

                if (!targetInmate) {
                    targetInmate = filteredInmates.find(inmate => {
                        const player = inmate.querySelector('.BL-player');
                        const crewMember = inmate.querySelector('.BL-crew-button[title="CrewA"]');
                        return crewMember && player && player.dataset.username !== username;
                    });
                }

                if (!targetInmate) {
                    targetInmate = filteredInmates.find(inmate => {
                        const player = inmate.querySelector('.BL-player');
                        const securityLevel = inmate.dataset.securityLevel;
                        return player && player.dataset.username !== username && securityLevel === "0";
                    });
                }

                if (!targetInmate) {
                    targetInmate = filteredInmates.find(inmate => {
                        const player = inmate.querySelector('.BL-player');
                        const securityLevel = inmate.dataset.securityLevel;
                        return player && player.dataset.username !== username && securityLevel === "1";
                    });
                }

                if (!targetInmate) {
                    targetInmate = filteredInmates.find(inmate => {
                        const player = inmate.querySelector('.BL-player');
                        const securityLevel = inmate.dataset.securityLevel;
                        return player && player.dataset.username !== username && securityLevel === "2";
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

                setTimeout(() => startAutoBust(updatedTable), Math.random() * 100 + 100); // Retry after 6-14 seconds
            }, 100);
        }
    });
});
