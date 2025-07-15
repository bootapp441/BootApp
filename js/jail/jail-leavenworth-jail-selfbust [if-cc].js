document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {        
        // Function to extract the username from the page
        function getUsername() {
            const usernameDiv = document.querySelector('.character-container .username a');
            return usernameDiv ? usernameDiv.textContent.trim() : 'unknown';
        }

        const leavenworthTable = document.querySelector('.jail-table.block-table');

        // Main jail logic
        function checkJailAndPerformActions() {
         
            const username = getUsername(); // Retrieve the username
            // console.log(`Current username: ${username}`);

            // Check if Leavenworth Penitentiary table exists
            const leavenworthTable = document.querySelector('.jail-table.block-table');
            if (leavenworthTable) {
                handleLeavenworthActions(leavenworthTable, username);
            }
        }

        // Function to handle Leavenworth-specific actions
        function handleLeavenworthActions(leavenworthTable, username) {
            // console.log("Starting actions for Leavenworth Penitentiary.");

            const captchaIframe = document.querySelector('iframe[title="reCAPTCHA"]');
            if (captchaIframe) {
                console.log('CAPTCHA detected. Pausing Bust for 20 seconds.');
                localStorage.setItem('resumeAutoBust5', 'true'); // Store state to resume AutoBust
                setTimeout(() => {
                    location.reload(); // Reload the page
                }, 20000); // Wait for table refresh
                return;
            }

            function refetchLeavenworthTable() {
                const updatedTable = document.querySelector('.jail-table.block-table');
                const userInmate = Array.from(updatedTable.querySelectorAll('.inmates .inmate')).find(inmate => {
                    const player = inmate.querySelector('.BL-player');
                    return player && player.dataset.username === username;
                });
                if (!userInmate) {
                    // console.log("Username no longer in Leavenworth Penitentiary. Rechecking in 10 seconds...");
                    setTimeout(checkJailAndPerformActions, 300);
                    return null;
                } else {
                    setTimeout(() => {
                        const refreshIcon = leavenworthTable.querySelector('.ui-icon.icon-refresh > div');
                        refreshIcon.click();   
                    }, 100);
                }
                return { updatedTable, userInmate };
            }

            const userInmate = Array.from(leavenworthTable.querySelectorAll('.inmates .inmate')).find(inmate => {
                const player = inmate.querySelector('.BL-player');
                return player && player.dataset.username === username;
            });

            if (userInmate) {
                const bustOutDiv = userInmate.querySelector('.bust-container .bust-link');
                const securityLevel = userInmate.dataset.securityLevel;

                if (bustOutDiv && securityLevel === "1") {
                    // console.log("Performing self bust...");
                    bustOutDiv.click();
                }
            }

            setTimeout(() => {
                const refetchedAfterBust = refetchLeavenworthTable();
                if (!refetchedAfterBust) return;

                //console.log("Attempting Slash Out...");
                checkSlashOut(() => {
                    setTimeout(() => {
                        const refetchedAfterSlashOut = refetchLeavenworthTable();
                        if (!refetchedAfterSlashOut) return;

                        //console.log("Attempting Cigarette Bust...");
                        checkCigaretteBust(() => {
                            setTimeout(() => {
                                const refetchedAfterCigarette = refetchLeavenworthTable();
                                if (!refetchedAfterCigarette) return;

                                //console.log("Attempting Adieu...");
                                checkAdieu(() => {
                                    setTimeout(() => {
                                        const refetchedAfterAdieu = refetchLeavenworthTable();
                                        if (!refetchedAfterAdieu) return;

                                        const userTimer = refetchedAfterAdieu.userInmate.querySelector('.BL-timer-display.timeleft');
                                        if (userTimer) {
                                            const timerText = userTimer.textContent.trim();
                                            //console.log(`User timer detected: ${timerText}`);
                                            if (timerText !== "00:00:00") {
                                                //console.log("User timer not yet 00:00:00. Rechecking in 10 seconds...");
                                                setTimeout(checkJailAndPerformActions, 300);
                                                return;
                                            }
                                        } else {
                                            //console.log("No timer found for the user.");
                                        }

                                        //console.log("Rechecking Leavenworth Penitentiary table in 10 seconds...");
                                        setTimeout(checkJailAndPerformActions, 300);
                                    }, Math.random() * 100 + 100);
                                });
                            }, Math.random() * 100 + 100);
                        });
                    }, Math.random() * 100 + 100);
                });
            }, Math.random() * 100 + 100);
        }

        // Function to handle Slash Out
        function checkSlashOut(callback) {
            const slashOutDiv = document.querySelector('.slash-out.BL-timer');
            if (slashOutDiv) {
                const slashTimer = slashOutDiv.querySelector('.slash-option.slash-unready.BL-timer-display');
                if (slashTimer && slashTimer.textContent.trim() === "00:00:00") {
                    // console.log("Slash Out timer reached 00:00:00. Performing Slash Out...");
                    const slashReadyButton = slashOutDiv.querySelector('.slash-option.slash-ready');
                    if (slashReadyButton) {
                        slashReadyButton.click();
                        setTimeout(callback, Math.random() * 100 + 100); // Delay after Slash Out
                        return;
                    }
                } else {
                    // console.log("Slash Out not ready.");
                }
            } else {
                // console.log("Slash Out feature not found.");
            }
            setTimeout(callback, Math.random() * 100 + 100); // Proceed if Slash Out is unavailable
        }

        function checkCigaretteBust(callback) {
            const quickActionsDiv = document.querySelector('.quick-actions');
            if (!quickActionsDiv) {
                console.log("Quick actions menu not found.");
                setTimeout(callback, Math.random() * 100 + 100);
                return;
            }
        
            // Ensure the quick-actions menu is open
            if (!quickActionsDiv.classList.contains('open')) {
                const arrowIcon = quickActionsDiv.querySelector('.arrow-icon');
                if (arrowIcon) {
                    arrowIcon.click();
                }
                setTimeout(() => checkCigaretteBust(callback), Math.random() * 100 + 100);
                return;
            }
        
            // Check if a timer is running
            const activeTimer = quickActionsDiv.querySelector('.BL-timer.BL-timer-active .BL-timer-display');
            if (activeTimer) {
                const timerText = activeTimer.textContent.trim();
                console.log(`Cigarette timer is active: ${timerText}. Skipping cigarette action.`);
                setTimeout(callback, Math.random() * 100 + 100); // Delay and proceed to next action
                return;
            }
        
            // Locate cigarette-related items
            const sealedPacks = quickActionsDiv.querySelectorAll('.BL-item.no-info[data-id="76"], .BL-item.no-info[data-id="77"]');
            const unsealedPacks = quickActionsDiv.querySelectorAll('.BL-item.no-info[data-id="78"], .BL-item.no-info[data-id="79"]');
            const cigarettes = quickActionsDiv.querySelectorAll('.BL-item.no-info[data-id="31"]'); // Individual cigarettes
        
            if (sealedPacks.length > 0) {
                console.log("Found sealed packs. Unsealing first...");
                sealedPacks[0].click();
                setTimeout(() => checkCigaretteBust(callback), Math.random() * 100 + 100);
                return;
            }
        
            if (unsealedPacks.length > 0) {
                console.log("Found unsealed packs. Using one...");
                const packToUse = unsealedPacks[Math.floor(Math.random() * unsealedPacks.length)];
                packToUse.click();
                setTimeout(callback, Math.random() * 100 + 100);
                return;
            }
        
            if (cigarettes.length > 0) {
                console.log("Found individual cigarettes. Using one...");
                const cigaretteToUse = cigarettes[Math.floor(Math.random() * cigarettes.length)];
                cigaretteToUse.click();
                setTimeout(callback, Math.random() * 100 + 100);
                return;
            }
        
            console.log("No cigarette packs or individual cigarettes available.");
            setTimeout(callback, Math.random() * 100 + 100);
        }
        
        // Function to handle Adieu
        function checkAdieu(callback) {
            // console.log("Checking for 'Adieu!' ability...");

            const abilitiesNavLink = document.querySelector('.bottom-navigation .navigation-link[data-link="abilities-list"]');
            if (abilitiesNavLink && !abilitiesNavLink.classList.contains('active')) {
                console.log("Activating abilities section...");
                abilitiesNavLink.click();
                setTimeout(() => checkAdieu(callback), 300);
                return;
            }

            const abilitiesContainer = document.querySelector('.abilities');
            if (abilitiesContainer) {
                const adieuAbility = Array.from(abilitiesContainer.querySelectorAll('.ability')).find(ability => {
                    const name = ability.querySelector('.name');
                    return name && name.textContent.trim() === '"Adieu!"';
                });

                if (adieuAbility) {
                    // console.log("'Adieu!' ability found.");
                    const energyLabel = adieuAbility.querySelector('.BL-progress-bar .label');
                    if (energyLabel) {
                        const energyText = energyLabel.textContent.trim();
                        const [currentEnergy] = energyText.split('/').map(Number);
                        if (currentEnergy > 12) {
                            console.log(`Using "Adieu!" ability with energy: ${currentEnergy}`);
                            const useButton = adieuAbility.querySelector('.use-button');
                            if (useButton) {
                                useButton.click();
                                setTimeout(callback, Math.random() * 100 + 100);
                                return;
                            }
                        } else {
                            // console.log(`Not enough energy for "Adieu!": ${currentEnergy}`);
                        }
                    }
                } else {
                    console.log("'Adieu!' ability not found.");
                }
            }
            setTimeout(callback, Math.random() * 100 + 100);
        }

        // Initial jail check
        checkJailAndPerformActions();
    });
});
