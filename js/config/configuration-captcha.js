document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        const DETECTED_TIME = parseInt(localStorage.getItem('captcha.DetectedTime')) || 0;
        const DETECTED_TIME_STRING = DETECTED_TIME 
        ? new Date(DETECTED_TIME).toLocaleString() 
        : 'Not now';
        const SITE_KEY = getSiteKeyFromInlineScript();
        
        // === 3. Create new Configuration crime box ===
        const crimesContainer = document.querySelector('.crimes-table .BL-content-inner-box.crimes-box .crimes');

        const newCrimeDiv = document.createElement('div');
        newCrimeDiv.className = 'crime BL-content BL-content-inner crime-configuration';
        newCrimeDiv.setAttribute('data-start-time', '0');
        newCrimeDiv.setAttribute('data-length', '0');
        newCrimeDiv.setAttribute('data-id', '9996');

        // Settings configuration
        const settingsHTML = `
            <label>&nbsp;Block duration <input type="number" id="captcha.blockDuration" min="0" max="1800000" step="1000"> ms</label>
            <label><input type="checkbox" id="capsolver.enabled"> Enable CapSolver API </label>
            <label>&nbsp;CapSolver API Key <input type="text" id="capsolver.api.key"></label>
            <label>&nbsp;reCAPTCHA Challenge Active : '${DETECTED_TIME_STRING}'</label>
            <label>&nbsp;reCAPTCHA Bootleggers SiteKey : '${SITE_KEY}'</label>
        `;

        newCrimeDiv.innerHTML = `
            <div class="container">
                <div class="right">
                    <div class="details">
                        <div class="name"><span>reCAPTCHA</span></div>
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
                    <div class="crime-image" data-id="9996"><div></div></div>
                </div>
            </div>
        `;

        if (crimesContainer) {
            crimesContainer.appendChild(newCrimeDiv);
        }

        // === 4. Load settings from localStorage ===
        const settings = [
            { id: 'captcha.blockDuration', type: 'number', default: 120000 },
            { id: 'capsolver.enabled', type: 'checkbox', default: false },
            { id: 'capsolver.api.key', type: 'value', default: 'CAP-ZZZZZZZZXXXXXXXXXYYYYYYYYYYZZZZZ' },
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
            .crime[data-id="9996"] .reward-box::before {
                content: none !important;
            }
            .crime[data-id="9996"] .settings-wrapper {
                margin-top: 10px;
                margin-bottom: 10px;
                line-height: 1.6;
            }
            .crime[data-id="9996"] .settings-wrapper label {
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
