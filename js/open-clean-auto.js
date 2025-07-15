document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        setTimeout(() => {
            const page = window.location.href;
            const cleanCrimes = (localStorage.getItem('autoCleanCrimes') ?? 'false') === 'true';
            const cleanRackets = (localStorage.getItem('autoCleanRackets') ?? 'false') === 'true';
            const cleanForums = (localStorage.getItem('autoCleanForums') ?? 'false') === 'true';

            // Early return based on page + toggle match
            if (
                (page.includes('crimes.php') && !cleanCrimes) ||
                (page.includes('rackets.php') && !cleanRackets) ||
                (page.includes('forum_new/index.php?flag=1&goto=616827') && !cleanForums)
            ) {
                console.log('🚫 Auto-clean not enabled for this page — exiting script.');
                return;
            }

            // Also exit if page doesn't match either target page
            if (
                !page.includes('crimes.php') &&
                !page.includes('rackets.php') &&
                !page.includes('forum_new/index.php?flag=1&goto=616827')
            ) {
                return;
            }

            // Helper delay function
            function delay(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            // Open character menu and click the Stamps div
            async function clickStampsAfterMenu() {
                // Open character menu
                await delay(1500); // Wait for menu to load
                const menuButton = document.querySelector('.sideBar .cat .items-shortcut');
                await delay(1500); // Wait for menu to load
                if (menuButton) {
                    menuButton.click();
                    console.log("Character menu opened.");
                    await delay(1500); // Wait for menu to load
                } else {
                    console.log("Menu button not found.");
                    return;
                }

                // Click the Stamps div
                await delay(1500); // Wait for menu to load
                const stampsDiv = document.querySelector('.open-clean-collection');
                await delay(1500); // Wait for menu to load
                if (stampsDiv) {
                    await delay(1500); // Wait for menu to load
                    stampsDiv.click();
                    console.log("Stamps div clicked.");
                } else {
                    console.log("Stamps div not found.");
                }
                await delay(1500); // Wait for menu to load
                $('.icon-close.main').trigger('click');
            }

            // 20% chance to execute clickStampsAfterMenu
            if (Math.random() < 0.50) {
                console.log("50% chance triggered. Running clickStampsAfterMenu...");
                delay(2000); // Wait for menu to load
                clickStampsAfterMenu();
            }
        }, 15000);
    });
});
