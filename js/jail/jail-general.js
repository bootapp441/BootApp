document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        const ADIEU_TO_USE = Number.isInteger(parseInt(localStorage.getItem('enableJailAdieuAmount')))
            ? parseInt(localStorage.getItem('enableJailAdieuAmount'))
            : 3;

        // except on jail page
        if (window.location.href.includes('https://www.bootleggers.us/jail.php')) {
            console.log('This script is excluded from running on this page.');
            // Exit the script
            return;
        }

        // Main jail logic
        function checkJailAndPerformActions() {
            // Check if general jail table exists
            const jailTable = document.querySelector('table.block-table.sub2.centered');
            if (jailTable) {
                const firstCell = jailTable.querySelector('tr > td.header.text-center');
                if (firstCell && firstCell.textContent.trim() === "You are in jail!") {
                    console.log("Detected general jailed page with 'You are in jail!'");
                    handleGeneralJailActions(jailTable);

                    // Check page for timer, then reload/refresh.
                    function checkTimer() {
                        const timerElement = jailTable.querySelector('.main-timer.BL-timer-display.BL-timer');
                        if (timerElement) {
                            const timerText = timerElement.textContent.trim();
                            console.log(`Timer detected: ${timerText}`);
                            if (timerText !== "00:00:00") {
                                console.log("Timer not yet 00:00:00. Rechecking in 10 seconds...");
                                setTimeout(checkJailAndPerformActions, 10000);
                                return;
                            }
                        }
                        console.log("Refreshing/reloading page...");
                        refreshPage();
                    }
                    setTimeout(checkTimer, Math.random() * 1000 + 4000);
                } else {
                    console.log("No 'You are in jail!' message found. Rechecking in 10 seconds...");
                    setTimeout(checkJailAndPerformActions, 10000);
                }
            } else {
                // console.log("No jail table detected. Rechecking in 10 seconds...");
                setTimeout(checkJailAndPerformActions, 3000);
            }
        }

        // Do max one self-bust attempt or fix prematurely busted out already.
        let selfBustAttempted = false;
        let selfBustFailedOrStuck = false;

        // Function to handle general jailed page actions
        function handleGeneralJailActions(jailTable) {
            console.log("Starting actions for general jailed page.");

            const bustLink = jailTable.querySelector('.self-bust-container.show .attempt-self-bust');
            setTimeout(() => {
                if (bustLink) {
                    if (!selfBustAttempted) {
                        console.log("Attempting to self bust for the first time...");
                        bustLink.click();
                        selfBustAttempted = true;

                        setTimeout(() => {
                            checkJailAndPerformActions(); // Continue the loop to evaluate outcome
                        }, Math.random() * 1000 + 1000);
                        return;
                    } else if (!selfBustFailedOrStuck) {
                        console.log("Bust link still present after attempt. Assuming player is free or stuck. Reloading...");
                        selfBustFailedOrStuck = true;
                        refreshPage();
                        return;
                    }
                } else {
                    console.log("No self-bust link found.");
                }

                // Continue other jail actions if no early exit
                setTimeout(() => {
                    console.log("Attempting Slash Out...");
                    checkSlashOut(() => {
                        setTimeout(() => {
                            console.log("Attempting Cigarette Bust...");
                            checkCigaretteBust(() => {
                                setTimeout(() => {
                                    console.log("Attempting Adieu...");
                                    checkAdieu(() => {
                                        setTimeout(() => {
                                            checkJailAndPerformActions();
                                        }, Math.random() * 1200 + 6000);
                                    });
                                }, Math.random() * 1000 + 1000);
                            });
                        }, Math.random() * 1000 + 1000);
                    });
                }, Math.random() * 1000 + 1000);
            }, Math.random() * 1000 + 1000);
        }

        // Function to handle Slash Out
        function checkSlashOut(callback) {
            const slashOutDiv = document.querySelector('.slash-out.BL-timer');
            if (slashOutDiv) {
                const slashTimer = slashOutDiv.querySelector('.slash-option.slash-unready.BL-timer-display');
                if (slashTimer && slashTimer.textContent.trim() === "00:00:00") {
                    console.log("Slash Out timer reached 00:00:00. Performing Slash Out...");
                    const slashReadyButton = slashOutDiv.querySelector('.slash-option.slash-ready');
                    if (slashReadyButton) {
                        slashReadyButton.click();
                        setTimeout(callback, Math.random() * 1000 + 1000); // Delay after Slash Out
                        return;
                    }
                } else {
                    console.log("Slash Out not ready.");
                }
            } else {
                console.log("Slash Out feature not found.");
            }
            setTimeout(callback, Math.random() * 1000 + 1000); // Proceed if Slash Out is unavailable
        }

        function checkCigaretteBust(callback) {
            const quickActionsDiv = document.querySelector('.quick-actions');
            if (!quickActionsDiv) {
                console.log("Quick actions menu not found.");
                setTimeout(callback, Math.random() * 1000 + 1000);
                return;
            }

            // Ensure the quick-actions menu is open
            if (!quickActionsDiv.classList.contains('open')) {
                const arrowIcon = quickActionsDiv.querySelector('.arrow-icon');
                if (arrowIcon) {
                    arrowIcon.click();
                }
                setTimeout(() => checkCigaretteBust(callback), Math.random() * 1000 + 1000);
                return;
            }

            // Check if a timer is running
            const activeTimer = quickActionsDiv.querySelector('.BL-timer.BL-timer-active .BL-timer-display');
            if (activeTimer) {
                const timerText = activeTimer.textContent.trim();
                console.log(`Cigarette timer is active: ${timerText}. Skipping cigarette action.`);
                setTimeout(callback, Math.random() * 1000 + 1000); // Delay and proceed to next action
                return;
            }

            // Locate cigarette-related items
            const sealedPacks = quickActionsDiv.querySelectorAll('.BL-item.no-info[data-id="76"], .BL-item.no-info[data-id="77"]');
            const unsealedPacks = quickActionsDiv.querySelectorAll('.BL-item.no-info[data-id="78"], .BL-item.no-info[data-id="79"]');
            const cigarettes = quickActionsDiv.querySelectorAll('.BL-item.no-info[data-id="31"]'); // Individual cigarettes
            const shivs = quickActionsDiv.querySelectorAll('.BL-item.no-info[data-id="21"]'); // Individual Shiv

            if (shivs.length > 0) {
                console.log("Found individual shiv. Using one...");
                const shivToUse = shivs[Math.floor(Math.random() * shivs.length)];
                shivToUse.click();
                setTimeout(callback, Math.random() * 1000 + 1000);
                return;
            }

            if (cigarettes.length > 0) {
                console.log("Found individual cigarettes. Using one...");
                const cigaretteToUse = cigarettes[Math.floor(Math.random() * cigarettes.length)];
                cigaretteToUse.click();
                setTimeout(callback, Math.random() * 1000 + 1000);
                return;
            }

            if (sealedPacks.length > 0) {
                console.log("Found sealed packs. Unsealing first...");
                sealedPacks[0].click();
                setTimeout(() => checkCigaretteBust(callback), Math.random() * 1000 + 1000);
                return;
            }

            if (unsealedPacks.length > 0) {
                console.log("Found unsealed packs. Using one...");
                const packToUse = unsealedPacks[Math.floor(Math.random() * unsealedPacks.length)];
                packToUse.click();
                setTimeout(callback, Math.random() * 1000 + 1000);
                return;
            }

            console.log("No cigarette packs or individual cigarettes available.");
            setTimeout(callback, Math.random() * 1000 + 1000);
        }

        // Function to handle Adieu
        function checkAdieu(callback) {
            console.log("Checking for 'Adieu!' ability...");

            const abilitiesNavLink = document.querySelector('.bottom-navigation .navigation-link[data-link="abilities-list"]');
            if (abilitiesNavLink && !abilitiesNavLink.classList.contains('active')) {
                console.log("Activating abilities section...");
                abilitiesNavLink.click();
                setTimeout(() => checkAdieu(callback), 2000);
                return;
            }

            const abilitiesContainer = document.querySelector('.abilities');
            if (abilitiesContainer) {
                const adieuAbility = Array.from(abilitiesContainer.querySelectorAll('.ability')).find(ability => {
                    const name = ability.querySelector('.name');
                    return name && name.textContent.trim() === '"Adieu!"';
                });

                if (adieuAbility) {
                    console.log("'Adieu!' ability found.");
                    const energyLabel = adieuAbility.querySelector('.BL-progress-bar .label');
                    if (energyLabel) {
                        const energyText = energyLabel.textContent.trim();
                        const [currentAdieu] = energyText.split('/').map(Number);
                        if (currentAdieu > ADIEU_TO_USE) {
                            console.log(`Using "Adieu!" ability available: ${currentAdieu}`);
                            const useButton = adieuAbility.querySelector('.use-button');
                            if (useButton) {
                                useButton.click();
                                setTimeout(callback, Math.random() * 1000 + 1000);
                                return;
                            }
                        } else {
                            console.log(`Not enough available "Adieu!": ${currentAdieu}`);
                        }
                    }
                } else {
                    console.log("'Adieu!' ability not found.");
                }
            }
            setTimeout(callback, Math.random() * 1000 + 1000);
        }

        // Function to refresh/reload page
        function refreshPage() {
            const randomChance = Math.random();
            if (randomChance < 0.7) {
                console.log("Simulating hyperlink click to refresh the page (70% chance).");
                const link = document.createElement('a');
                link.href = window.location.href;
                link.click();
            } else {
                console.log("Using location.reload() to refresh the page (30% chance).");
                location.reload();
            }
        }

        // Random delay for initial jail check
        setTimeout(() => {
            checkJailAndPerformActions();
        }, Math.random() * 1000 + 3000);
    });
});
