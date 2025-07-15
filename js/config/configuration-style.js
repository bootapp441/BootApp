document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        // === 3. Create new Configuration crime box ===
        const crimesContainer = document.querySelector('.crimes-table .BL-content-inner-box.crimes-box .crimes');

        const newCrimeDiv = document.createElement('div');
        newCrimeDiv.className = 'crime BL-content BL-content-inner crime-configuration';
        newCrimeDiv.setAttribute('data-start-time', '0');
        newCrimeDiv.setAttribute('data-length', '0');
        newCrimeDiv.setAttribute('data-id', '9999');

        // Settings configuration
        const settingsHTML = `
            <label>&nbsp;characterMenu.style.maxWidth : '280px' &nbsp;<input type="value" id="style.characterMenu.maxWidth"></label>
            <label>&nbsp;characterMenu.style.border : '1px solid #595652' &nbsp;<input type="value" id="style.characterMenu.border"></label>
            <label>&nbsp;characterContainer.style.height : '335px' &nbsp;<input type="value" id="style.characterContainer.height"></label>
            <label>&nbsp;carListingPanel.style.maxHeight : '44em' &nbsp;<input type="value" id="style.carListingPanel.maxHeight"></label>
            <label>&nbsp;crimesTable.style.maxWidth : '420px' &nbsp;<input type="value" id="style.crimesTable.maxWidth"></label>
            <label>&nbsp;crimesTable.style.margin : '2em auto' &nbsp;<input type="value" id="style.crimesTable.margin"></label>
            <label><input type="checkbox" id="style.boss"> Boss Mode | Remove specific elements</label>
        `;

        newCrimeDiv.innerHTML = `
            <div class="container">
                <div class="right">
                    <div class="details">
                        <div class="name"><span>Style Parameters</span></div>
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
                    <div class="crime-image" data-id="9999"><div></div></div>
                </div>
            </div>
        `;

        if (crimesContainer) {
            crimesContainer.appendChild(newCrimeDiv);
        }

        // === 4. Load settings from localStorage ===
        const settings = [
            { id: 'style.characterMenu.maxWidth', type: 'value', default: '388px' },
            { id: 'style.characterMenu.border', type: 'value', default: '2px solid #595652' },
            { id: 'style.characterContainer.height', type: 'value', default: '500px' },
            { id: 'style.carListingPanel.maxHeight', type: 'value', default: '60em' },
            { id: 'style.crimesTable.maxWidth', type: 'value', default: '640px' },
            { id: 'style.crimesTable.margin', type: 'value', default: '-1em auto' },
            { id: 'style.boss', type: 'checkbox', default: false },
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
            .crime[data-id="9999"] .reward-box::before {
                content: none !important;
            }
            .crime[data-id="9999"] .settings-wrapper {
                margin-top: 10px;
                margin-bottom: 10px;
                line-height: 1.6;
            }
            .crime[data-id="9999"] .settings-wrapper label {
                display: block;
                margin-bottom: 6px;
            }
        `;
        document.head.appendChild(style);
    });
});
