document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {

        function isLeaderModeEnabled() {
            return localStorage.getItem('oc.leader.mode') === 'true';
        }

        function canCommitCrime() {
            let allReady = true;
        
            $('td.member-info').each(function (index) {
                const $cell = $(this);
                const userCell = $cell.closest('td').prevAll('.header.member-header').find('a').text().trim() || `Position ${index + 1}`;
                const role = $cell.find('tr b').first().text().trim();
                const isReady = $cell.find('td:contains("Ready!")').length > 0;
                const isOnline = $cell.find('div.status-online, td:contains("Online")').length > 0;
                const inventory = $cell.find('tr:contains("Inventory:") td:last-child').text().trim();
        
                let hasRequiredItem = true;
        
                if (role === 'Weapons expert') {
                    hasRequiredItem = inventory.includes('Chopper Squad');
                } else if (role === 'Explosives expert') {
                    hasRequiredItem = inventory.includes('Dynamite') || inventory.includes('Forged Bank Keys');
                } else if (role === 'Driver') {
                    hasRequiredItem = inventory.includes('99%') && inventory.includes('0% dmg');
                }
        
                console.log(`[OC-L-Commit] ${userCell} (${role}): Ready=${isReady}, Online=${isOnline}, Inventory="${inventory}", HasRequired=${hasRequiredItem}`);
        
                if (!isReady || !isOnline || !hasRequiredItem) {
                    allReady = false;
                }
            });
        
            console.log(`[OC-L-Commit] All members ready, online, and equipped: ${allReady}`);
            return allReady;
        }

        function tryCommitCrime() {
            const commitBtn = $('input[type="submit"][name="commitcrime"][value="Commit the crime!"]');
            if (commitBtn.length) {
                console.log('[OC-L-Commit] All members ready, online, and properly equipped. Committing crime...');
                commitBtn.trigger('click');
            } else {
                console.warn('[OC-L-Commit] Commit button not found.');
            }
        }
        
        function checkAndCommit() {
            if (!isLeaderModeEnabled()) {
                console.log('[OC-L-Commit] Leader mode OFF — skipping commit check.');
                return;
            }

            if (!areAllPositionsFilled()) {
                console.log('[OC-L-Commit] Not all slots filled — skipping commit check.');
                return;
            }

            if (canCommitCrime()) {
                tryCommitCrime();
            } else {
                console.log('[OC-L-Commit] Not all members are ready and online — skipping commit.');
            }
        }

        function areAllPositionsFilled() {
            const memberHeaders = $('.header.member-header');

            // There must be 4 members (leader + 3)
            if (memberHeaders.length !== 4) {
                console.log(`[OC-L-Commit] Only ${memberHeaders.length}/4 positions filled — exiting.`);
                return false;
            }

            // Check if any position is still marked as "None"
            let allFilled = true;
            memberHeaders.each(function (index) {
                const name = $(this).find('a').text().trim();
                if (!name || name.toLowerCase() === 'none') {
                    console.log(`[OC-L-Commit] Position ${index + 1} is not filled.`);
                    allFilled = false;
                }
            });

            console.log(`[OC-L-Commit] All 4 positions filled: ${allFilled}`);
            return allFilled;
        }

        // === Execute in order ===
        const initialDelay = Math.floor(Math.random() * 2000) + 1000;
        console.log(`[OC-L-Commit] Waiting ${initialDelay}ms before initial commit check...`);

        setTimeout(() => {
            checkAndCommit();
        }, initialDelay);
    });
});
