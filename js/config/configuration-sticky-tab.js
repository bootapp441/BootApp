document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        // === 3. Create new Configuration crime box ===
        const crimesContainer = document.querySelector('.crimes-table .BL-content-inner-box.crimes-box .crimes');

        const newCrimeDiv = document.createElement('div');
        newCrimeDiv.className = 'crime BL-content BL-content-inner crime-configuration';
        newCrimeDiv.setAttribute('data-start-time', '0');
        newCrimeDiv.setAttribute('data-length', '0');
        newCrimeDiv.setAttribute('data-id', '9991');

        // Settings configuration
        const settingsHTML = `
            This script monitors up to 10 specific Bootleggers pages across open browser tabs, tracking which URLs are active in each tab via localStorage. It detects anomalies like missing, duplicate, or stale tabs, and automatically redirects tabs to ensure each monitored page is always open in exactly one active tab.<br>
            <label><input type="checkbox" id="sticky.enabled"> Enable Sticky Tabs</label>
            <label>Tab check interval <input type="text" id="sticky.interval" placeholder="5000"> ms</label>
            <label>Outdated tab threshold <input type="text" id="sticky.anomaly" placeholder="6000"> ms</label>
            <label>Cleanup stale tabs after <input type="text" id="sticky.cleanup" placeholder="60000"> ms</label>
            <label>Default monitored pages (max 10):<br>
            <textarea id="sticky.pages" style="width: 100%; height: 80px; font-size: 12px;" placeholder="One URL per line...">https://www.bootleggers.us/forum_new/index.php?flag=1&goto=616827
            https://www.bootleggers.us/auto-theft.php
            https://www.bootleggers.us/bootlegging.php
            https://www.bootleggers.us/crimes.php
            https://www.bootleggers.us/rackets.php</textarea>
            </label>
            <label><input type="checkbox" id="sticky.consoleLog"> Enable Console Log</label>
        `;

        newCrimeDiv.innerHTML = `
            <div class="container">
                <div class="right">
                    <div class="details">
                        <div class="name"><span>Sticky Tabs Manager</span></div>
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
                    <div class="crime-image" data-id="9991"><div></div></div>
                </div>
            </div>
        `;

        if (crimesContainer) {
            crimesContainer.appendChild(newCrimeDiv);
        }

        // === 4. Load settings from localStorage ===
        const settings = [
            { id: 'sticky.enabled', type: 'checkbox', default: false },
            { id: 'sticky.interval', type: 'text', default: '5000' },
            { id: 'sticky.anomaly', type: 'text', default: '6000' },
            { id: 'sticky.cleanup', type: 'text', default: '60000' },
            { id: 'sticky.pages', type: 'text', default:
                `https://www.bootleggers.us/forum_new/index.php?flag=1&goto=616827\n` +
                `https://www.bootleggers.us/auto-theft.php\n` +
                `https://www.bootleggers.us/bootlegging.php\n` +
                `https://www.bootleggers.us/crimes.php\n` +
                `https://www.bootleggers.us/rackets.php`
            },
            { id: 'sticky.consoleLog', type: 'checkbox', default: false },
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
            .crime[data-id="9991"] .reward-box::before {
                content: none !important;
            }
            .crime[data-id="9991"] .settings-wrapper {
                margin-top: 10px;
                margin-bottom: 10px;
                line-height: 1.6;
            }
            .crime[data-id="9991"] .settings-wrapper label {
                display: block;
                margin-bottom: 6px;
            }
        `;
        document.head.appendChild(style);
    });
});
