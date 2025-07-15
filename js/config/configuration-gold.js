document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        // === 3. Create new Configuration crime box ===
        const crimesContainer = document.querySelector('.crimes-table .BL-content-inner-box.crimes-box .crimes');

        const newCrimeDiv = document.createElement('div');
        newCrimeDiv.className = 'crime BL-content BL-content-inner crime-configuration';
        newCrimeDiv.setAttribute('data-start-time', '0');
        newCrimeDiv.setAttribute('data-length', '0');
        newCrimeDiv.setAttribute('data-id', '9992');

        // Settings configuration
        const settingsHTML = `
            Only use this mode if reporter is a server. This script monitors gold listings on a specified webpage and sends alerts to Discord if a significant price drop is detected. It also sends an hourly baseline price report and allows customization of behavior through specific parameters.<br>
            <label><input type="checkbox" id="gold.alert"> Auto Alert activated</label>
            <label><input type="text" id="gold.trigger" placeholder="0.075"> % drop triggers an alert</label>
            <label>If price goes <input type="text" id="gold.recovery" placeholder="0.03"> % above baseline, reset baseline</label>
            <label>Alert cooldown <input type="text" id="gold.cooldown" placeholder="300000"> ms</label>
            <label>Alert base interval <input type="text" id="gold.interval" placeholder="8000"> ms</label>
            <label>Exclude batch size offers with <input type="text" id="gold.skip" placeholder="95000"> gold</label>
            <label>We send a baseline report every <input type="text" id="gold.alert.baseline" placeholder="3600000"> ms</label>
        `;

        newCrimeDiv.innerHTML = `
            <div class="container">
                <div class="right">
                    <div class="details">
                        <div class="name"><span>Gold auto alert</span></div>
                        <div class="reward-box">
                            <div class="BL-currency-label">
                                <div class="settings-wrapper">
                                    ${settingsHTML}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="image">
                    <div class="crime-image" data-id="9992"><div></div></div>
                </div>
            </div>
        `;

        if (crimesContainer) {
            crimesContainer.appendChild(newCrimeDiv);
        }

        // === 4. Load settings from localStorage ===
        const settings = [
            { id: 'gold.alert', type: 'checkbox', default: false },
            { id: 'gold.trigger', type: 'text', default: '0.075' },
            { id: 'gold.recovery', type: 'text', default: '0.03' },
            { id: 'gold.cooldown', type: 'text', default: '300000' },
            { id: 'gold.interval', type: 'text', default: '8000' },
            { id: 'gold.skip', type: 'text', default: '95000' },
            { id: 'gold.alert.baseline', type: 'text', default: '3600000' }
        ];

        settings.forEach(setting => {
            const el = document.getElementById(setting.id);
            if (!el) return;

            // Load from localStorage or use default
            const saved = localStorage.getItem(setting.id);

            if (setting.type === 'checkbox') {
                const value = saved !== null ? saved === 'true' : setting.default;
                el.checked = value;
                if (saved === null) localStorage.setItem(setting.id, value);
            } else {
                const value = saved !== null ? saved : setting.default;
                el.value = value;
                if (saved === null) localStorage.setItem(setting.id, value);
            }

            // Save on change
            el.addEventListener('change', () => {
                if (setting.type === 'checkbox') {
                    localStorage.setItem(setting.id, el.checked);
                } else {
                    localStorage.setItem(setting.id, el.value);
                }
            });
        });

        // === 5. Add custom styles ===
        const style = document.createElement('style');
        style.textContent = `
            .crime[data-id="9992"] .reward-box::before {
                content: none !important;
            }
            .crime[data-id="9992"] .settings-wrapper {
                margin-top: 10px;
                margin-bottom: 10px;
                line-height: 1.6;
            }
            .crime[data-id="9992"] .settings-wrapper label {
                display: block;
                margin-bottom: 6px;
            }
        `;
        document.head.appendChild(style);
    });
});
