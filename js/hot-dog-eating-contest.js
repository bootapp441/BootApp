document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {

        // Add checkbox and number input next to "Current Rewards"
        const rewardsHeader = $('h4:contains("Current Rewards")');
        if (rewardsHeader.length && !$('#auto-eater-toggle').length) {
            const savedState = localStorage.getItem('event.hotdog.enabled') || 'TRUE';
            const savedTarget = parseInt(localStorage.getItem('event.hotdog.target') || '4', 10);
            const isChecked = savedState === 'TRUE' ? 'checked' : '';
            const checkboxHTML = `
                <label style="margin-left:10px; font-weight:normal;">
                    <input type="checkbox" id="auto-eater-toggle" ${isChecked}>
                    Auto Eat
                </label>
                <label style="margin-left:10px; font-weight:normal;">
                    Fill Target:
                    <input type="number" id="auto-eater-target" min="1" max="10" value="${savedTarget}" style="width: 50px;">
                </label>`;
            rewardsHeader.append(checkboxHTML);
        }

        // Update localStorage on toggle
        $(document).on('change', '#auto-eater-toggle', function () {
            const value = this.checked ? 'TRUE' : 'FALSE';
            localStorage.setItem('event.hotdog.enabled', value);
            console.log('Auto Eat set to:', value);
        });

        // Update localStorage on number input change
        $(document).on('input', '#auto-eater-target', function () {
            let val = parseInt(this.value, 10);
            if (isNaN(val) || val < 1) val = 1;
            if (val > 10) val = 10;
            this.value = val;
            localStorage.setItem('event.hotdog.target', val.toString());
            console.log('Auto Eat target set to:', val);
        });

        // Helpers
        function isFilled(level) {
            return $(`.progress-bar .segment.filled[data-level="${level}"]`).length > 0;
        }

        function filledCountLevel1to10() {
            return Array.from({ length: 10 }, (_, i) => i + 1).filter(isFilled).length;
        }

        function hasNoBatchWarning() {
            return $('body:contains("No batches of hot dogs ready!")').length > 0;
        }

        function hasStomachBugMessage() {
            return $('.description:contains("Stomach bug caused you to throw up all your rewards.")').is(':visible');
        }

        // Main loop
        function runAutoEatLoop() {
            const enabled = $('#auto-eater-toggle').is(':checked');
            const target = parseInt($('#auto-eater-target').val(), 10) || 4;

            if (!enabled) {
                console.log('Auto Eat is disabled. Stopping.');
                return;
            }

            const $energyBar = $('.BL-progress-bar[data-color="hot-dog-batch"] .label');
            const energyText = $energyBar.text().trim();
            const filledCount = filledCountLevel1to10();

            if (hasStomachBugMessage()) {
                console.warn('Stomach bug message detected. Reloading...');
                setTimeout(() => location.reload(), 500);
                return;
            }

            if (hasNoBatchWarning()) {
                console.warn('"No batches of hot dogs ready!" detected. Reloading...');
                setTimeout(() => location.reload(), 500);
                return;
            }

            if (energyText === '0/30' && filledCount === 0) {
                console.log('No energy and no progress. Waiting...');
                setTimeout(runAutoEatLoop, 10000);
                return;
            }

            if (filledCount >= target) {
                console.log(`${filledCount} segments filled. Target reached (${target}). Sending end request...`);
                fetch('/ajax/events/hotdog-eating-contest.php?action=end', {
                    method: 'POST',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': '*/*'
                    },
                    credentials: 'same-origin'
                }).then(() => {
                    console.log('End request sent. Reloading page...');
                    setTimeout(() => location.reload(), 500);
                }).catch(err => {
                    console.error('End request failed:', err);
                    setTimeout(runAutoEatLoop, 4000);
                });
                return;
            }

            const trayNum = Math.floor(Math.random() * 3) + 1;
            const tray = $(`.tray[data-tray="${trayNum}"] .hit-area`);
            if (tray.length) {
                tray.click();
                console.log(`Clicked tray ${trayNum}. Waiting 4s...`);
                setTimeout(runAutoEatLoop, 4000);
            } else {
                console.warn(`Tray ${trayNum} not found. Retrying in 4s...`);
                setTimeout(runAutoEatLoop, 4000);
            }
        }

        function waitForFirstBatch() {
            const $energyBar = $('.BL-progress-bar[data-color="hot-dog-batch"] .label');
            const energyText = $energyBar.text().trim();
            const enabled = $('#auto-eater-toggle').is(':checked');

            if (!enabled) {
                console.log('Auto Eat is off. Not starting.');
                return;
            }

            if (energyText !== '0/30') {
                console.log('Batch available. Starting loop...');
                runAutoEatLoop();
            } else {
                console.log('Waiting for first batch...');
                setTimeout(waitForFirstBatch, 5000);
            }
        }

        setTimeout(waitForFirstBatch, 1000);
    });
});
