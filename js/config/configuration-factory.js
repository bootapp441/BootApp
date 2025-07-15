document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        // === 3. Create new Configuration crime box ===
        const crimesContainer = document.querySelector('.crimes-table .BL-content-inner-box.crimes-box .crimes');

        const newCrimeDiv = document.createElement('div');
        newCrimeDiv.className = 'crime BL-content BL-content-inner crime-configuration';
        newCrimeDiv.setAttribute('data-start-time', '0');
        newCrimeDiv.setAttribute('data-length', '0');
        newCrimeDiv.setAttribute('data-id', '9994');

        // Grouped car models for better label structure
        const meltCarGroups = {
            "Heavy Cars": [
                "Hudson V12 Limousine",
                "Braxton 8 Litre",
                "Maynard 384 Speedster",
                "Castillon V16 Roadster",
                "Everett Series R 7-Passenger Touring",
                "Castillon V16",
                "Clausen Royal Close Coupled Sedan",
                "Barrett 480",
                "Maynard V12",
            ],
            "Scrap Cars": [
                "Porter Model 1 Closed Cab",
                "Auclair Type-3 GSS",
                "Chalamet Alliance Phaeton",
                "Porter Model 1 Tudor",
                "Porter Model 6 Touring",
                "Porter Model 11 Touring",
                "Porter V8",
                "Harlow-Ryder Model S35",
                "Swift Model 96",
                "Chalamet Liberty 1/2 Ton Pickup",
                "Asher 26-6"
            ]
        };

        let settingsHTML = `
            <label><input type="checkbox" id="enableFactoryBuy"> Auto Buy 100 bullets after first manually buy</label>
            <label><input type="checkbox" id="enableFactoryMelt"> Auto Melt cars</label>
            <label>&nbsp;Max Bullet cost <input type="number" id="maxBulletCost" min="0" step="50" value="1000"></label>
            <strong>Melt Models:</strong><br>
            <label><input type="checkbox" id="toggleAllModels"> [ Select / Deselect All ]</label>
        `;

        Object.entries(meltCarGroups).forEach(([group, models]) => {
            settingsHTML += `<strong style="display:block;margin-top:8px;">-- ${group} --</strong>`;
            models.forEach(model => {
                const id = `modelMelt.${model.replace(/\s+/g, '_')}`;
                settingsHTML += `<label><input type="checkbox" id="${id}"> ${model}</label>`;
            });
        });

        // Flatten model list for use in settings loading
        const meltCarModels = Object.values(meltCarGroups).flat();

        newCrimeDiv.innerHTML = `
            <div class="container">
                <div class="right">
                    <div class="details">
                        <div class="name"><span>Factory</span></div>
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
                    <div class="crime-image" data-id="9994"><div></div></div>
                </div>
            </div>
        `;

        if (crimesContainer) {
            crimesContainer.appendChild(newCrimeDiv);
        }

        // === 4. Load settings from localStorage ===
        const settings = [
            { id: 'enableFactoryBuy', type: 'checkbox', default: true },
            { id: 'enableFactoryMelt', type: 'checkbox', default: true },
            { id: 'maxBulletCost', type: 'number', default: 1000 },
            ...meltCarModels.map(model => ({
                id: `modelMelt.${model.replace(/\s+/g, '_')}`,
                type: 'checkbox',
                default: true
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

        const toggleAll = document.getElementById('toggleAllModels');
        if (toggleAll) {
            toggleAll.addEventListener('change', () => {
                meltCarModels.forEach(model => {
                    const id = `modelMelt.${model.replace(/\s+/g, '_')}`;
                    const el = document.getElementById(id);
                    if (el) {
                        el.checked = toggleAll.checked;
                        localStorage.setItem(id, toggleAll.checked);
                    }
                });
            });

            // Optional: initialize the state if all checkboxes are already the same
            const allOn = meltCarModels.every(model => {
                const id = `modelMelt.${model.replace(/\s+/g, '_')}`;
                return localStorage.getItem(id) === 'true';
            });
            toggleAll.checked = allOn;
        }


        // === 5. Add custom styles ===
        const style = document.createElement('style');
        style.textContent = `
            .crime[data-id="9994"] .reward-box::before {
                content: none !important;
            }
            .crime[data-id="9994"] .settings-wrapper {
                margin-top: 10px;
                margin-bottom: 10px;
                line-height: 1.6;
            }
            .crime[data-id="9994"] .settings-wrapper label {
                display: block;
                margin-bottom: 6px;
            }
        `;
        document.head.appendChild(style);
    });
});
