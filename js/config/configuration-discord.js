document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {

        // === 3. Create new Configuration crime box ===
        const crimesContainer = document.querySelector('.crimes-table .BL-content-inner-box.crimes-box .crimes');

        const newCrimeDiv = document.createElement('div');
        newCrimeDiv.className = 'crime BL-content BL-content-inner crime-configuration';
        newCrimeDiv.setAttribute('data-start-time', '0');
        newCrimeDiv.setAttribute('data-length', '0');
        newCrimeDiv.setAttribute('data-id', '9990');

        // Settings configuration
        const webhookLabels = [
            'Car Markdown',
            'Cities Overview',
            'Captcha',
            'Statistics',
            'Booze Spike',
            'Booze NoSpike',
            'Booze Sold',
            'Auto Theft',
            'Gold Prices',
            'Gold Baseline',
            'Gold Bought',
            'Gold Settings'
        ];

        const discordWebhookNames = {
            1: 'Car Markdown',
            2: 'Cities Overview',
            3: 'Captcha',
            4: 'Statistics',
            5: 'Booze Spike',
            6: 'Booze NoSpike',
            7: 'Booze Sold',
            8: 'Auto Theft',
            9: 'Gold Prices',
            10: 'Gold Baseline',
            11: 'Gold Bought',
            12: 'Gold Settings'
        };

        const settingsHTML = `
            <label><input type="checkbox" id="discord.enabled"> Enable Discord Webhooks. This enabled and empty value for category is still disabled for that category. </label>
            ${webhookLabels.map((label, i) => `
                <label>${label} <input type="text" id="discord.webhook.${i + 1}" value="https://discord.com/api/webhooks/your-dummy-url-${i + 1}"></label>
            `).join('')}
        `;

        newCrimeDiv.innerHTML = `
            <div class="container">
                <div class="right">
                    <div class="details">
                        <div class="name"><span>Discord Integration</span></div>
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
                    <div class="crime-image" data-id="9990"><div></div></div>
                </div>
            </div>
        `;

        if (crimesContainer) {
            crimesContainer.appendChild(newCrimeDiv);
        }

        // === 4. Load settings from localStorage ===
        const settings = [
            { id: 'discord.enabled', type: 'checkbox', default: false },
            ...Array.from({ length: 12 }, (_, i) => ({
                id: `discord.webhook.${i + 1}`,
                type: 'value',
                default: `https://discord.com/api/webhooks/your-dummy-url-${i + 1}`
            }))
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
            .crime[data-id="9990"] .reward-box::before {
                content: none !important;
            }
            .crime[data-id="9990"] .settings-wrapper {
                margin-top: 10px;
                margin-bottom: 10px;
                line-height: 1.6;
            }
            .crime[data-id="9990"] .settings-wrapper label {
                display: block;
                margin-bottom: 6px;
            }
        `;
        document.head.appendChild(style);

        // Parse inline BL.init({...}) and extract SiteKey
        function getSiteKeyFromInlineScript() {
            const scripts = document.querySelectorAll('script');

            for (let script of scripts) {
                if (script.textContent.includes('BL.init(')) {
                    try {
                        // Extract the JSON inside BL.init(...)
                        const jsonText = script.textContent.match(/BL\.init\((\{.*\})\);?/s);
                        if (jsonText && jsonText[1]) {
                            const jsonObj = JSON.parse(jsonText[1]);
                            return jsonObj.reCAPTCHAv2SiteKey || null;
                        }
                    } catch (err) {
                        console.error("Failed to parse BL.init script:", err);
                        return null;
                    }
                }
            }
            return null;
        }
    });
});
