document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {

        function tryActivateBoost() {
            const container = document.querySelector('.charge-container.is-init');
            if (!container) return console.log('[OC-ExpBoost] No boost container — skipping.');

            if (container.classList.contains('BL-timer-active')) return console.log('[OC-ExpBoost] Charging — skip.');

            const timerDisplay = container.querySelector('.BL-timer-display');
            if (!timerDisplay) return console.warn('[OC-ExpBoost] Timer display missing.');

            if (timerDisplay.textContent.trim() !== "") {
                console.log('[OC-ExpBoost] Timer still running — not ready.');
                return;
            }

            console.log('[OC-ExpBoost] Boost ready — sending fetch request...');

            fetch('https://www.bootleggers.us/ajax/orgcrime.php?action=boost-experience', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': '*/*',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: ''
            })
            .then(response => response.json())
            .then(json => {
                console.log('[OC-ExpBoost] Response:', json);
                if (json.success) {
                    console.log('[OC-ExpBoost] Boost activated successfully — refreshing page.');
                    setTimeout(() => location.href = location.href, 1500);
                } else {
                    console.warn('[OC-ExpBoost] Boost activation failed.');
                    setTimeout(() => location.href = location.href, 1500);
                }
            })
            .catch(err => {
                console.error('[OC-ExpBoost] Fetch error:', err);
                setTimeout(() => location.href = location.href, 1500);
            });
        }

        // Delay initial attempt to ensure all JS is loaded
        setTimeout(tryActivateBoost, 3000);
        setInterval(tryActivateBoost, 120000);

    });
});
