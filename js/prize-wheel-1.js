document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {

        // Create container and buttons
        const buttonContainer = $('<div style="margin-top: 10px;"></div>');
        const speeds = [
            { label: 'Spin (Normal)', delayMin: 4.5, delayMax: 6.5 },
            { label: 'Spin (Fast)', delayMin: 2.0, delayMax: 3.0 },
            { label: 'Spin (Ultra)', delayMin: 0.5, delayMax: 1.0 }
        ];

        speeds.forEach((speed, index) => {
            const button = $(`
                <button 
                    id="spin-btn-${index}" 
                    style="
                        margin: 3px; 
                        padding: 7px 15px; 
                        border-radius: 25px; 
                        border: 1px solid #aaa; 
                        background-color: #e0e0e0; 
                        color: #333; 
                        font-weight: 500; 
                        cursor: pointer;
                        transition: background-color 0.2s ease;
                    "
                    onmouseover="this.style.backgroundColor='#d5d5d5';"
                    onmouseout="this.style.backgroundColor='#e0e0e0';"
                >
                    ${speed.label}
                </button>
            `);
            button.click(() => startSpinning(speed.delayMin, speed.delayMax));
            buttonContainer.append(button);
        });

        // Add buttons to the page
        $('.tickets-shop-title').after(buttonContainer);

        async function getNickelCount() {
            const nickelText = $('p[data-player-stat="nickels"]').first().text().trim().replace(/,/g, '');
            return parseInt(nickelText) || 0;
        }

        async function spinWheel() {
            try {
                const response = await fetch('https://www.bootleggers.us/ajax/events/prize-wheel.php?action=spin', {
                    method: 'POST',
                    headers: {
                        'Accept': '*/*',
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: new URLSearchParams({ 'wheelId': '1', 'fast': 'true' })
                });
                const data = await response.json();
                console.log("Wheel spun:", data);
            } catch (err) {
                console.error("Spin error:", err);
            }
        }

        async function startSpinning(minDelay, maxDelay) {
            const nickels = await getNickelCount();
            if (nickels === 0) {
                console.log("No nickels available.");
                return;
            }

            console.log(`Spinning with delays between ${minDelay}s and ${maxDelay}s.`);
            for (let i = 0; i < nickels; i++) {
                await spinWheel();
                const delay = Math.random() * (maxDelay - minDelay) + minDelay;
                console.log(`Waiting ${delay.toFixed(2)} seconds before next spin.`);
                await new Promise(res => setTimeout(res, delay * 1000));
            }

            console.log("Finished all spins. Reloading page...");
            location.reload(); // Refresh the page after spins
        }

    });
});
