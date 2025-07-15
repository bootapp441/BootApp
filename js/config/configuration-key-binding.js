document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        // === 3. Create new Configuration crime box ===
        const crimesContainer = document.querySelector('.crimes-table .BL-content-inner-box.crimes-box .crimes');

        const newCrimeDiv = document.createElement('div');
        newCrimeDiv.className = 'crime BL-content BL-content-inner crime-configuration';
        newCrimeDiv.setAttribute('data-start-time', '0');
        newCrimeDiv.setAttribute('data-length', '0');
        newCrimeDiv.setAttribute('data-id', '9997');

        // Define keyBindingDefaults before use
        const keyBindingDefaults = {
            // enable/disable binding globally
            'function.keybinding': true,

            // menu
            'binding.profile': '1',
            'binding.items': '2',
            'binding.cars': '3',
            'binding.skills': '4',
            'binding.perks': '5',
            'binding.bank': '6',
            'binding.wallet': '7',
            'binding.cards': '8',

            // navigation
            'binding.prevPage': 'q',
            'binding.nextPage': 'e',
            'binding.left': 'a',
            'binding.right': 'd',
            'binding.arrowLeft': 'arrowleft',
            'binding.arrowRight': 'arrowright',

            // actions
            'binding.garage': 'g',
            'binding.ship': 'h',
            'binding.plates': 'j',
            'binding.repair': 'k',
            'binding.sell': 'l',
            'binding.drop': ';',

            // special actions
            'binding.shot': 'z',
            'binding.srepair': 'x',
            'binding.sship': 'c',
            'binding.ssell': 'v',
            
            // driver and car
            'binding.selectCar': 's',
            'binding.drive': 'f',
            'binding.stats': 'r',
            'binding.trunk': 't',

            // close and do
            'binding.goBack': 'w',
            'binding.doIt': 'enter',
            'binding.doItSpace': ' ',
        };

        // Purpose labels for each binding
        const keyBindingLabels = {
            // menu
            'binding.profile': 'Open Profile Menu',
            'binding.items': 'Open Items Menu',
            'binding.cars': 'Open Car Menu',
            'binding.skills': 'Open Skills Menu',
            'binding.perks': 'Open Perks Menu',
            'binding.bank': 'Open Bank Menu',
            'binding.wallet': 'Open Wallet Menu',
            'binding.cards': 'Open Cigarette Cards Menu',

            // navigation
            'binding.prevPage': 'Previous Page',
            'binding.nextPage': 'Next Page',
            'binding.left': 'Previous Car (A)',
            'binding.right': 'Next Car (D)',
            'binding.arrowLeft': 'Previous Car (Arrow Left)',
            'binding.arrowRight': 'Next Car (Arrow Right)',

            // actions
            'binding.garage': 'Garage Action',
            'binding.ship': 'Ship Car',
            'binding.plates': 'Change Plates',
            'binding.repair': 'Repair Car',
            'binding.sell': 'Sell Car',
            'binding.drop': 'Drop Car (Remap to Ø for Norwegian)',

            // special actions
            'binding.shot': 'Change all plates',
            'binding.srepair': 'Repair all cars',
            'binding.sship': 'Ship all cars',
            'binding.ssell': 'Sell all cars',
            
            // driver and car
            'binding.selectCar': 'Select First Car',
            'binding.drive': 'Drive Current Car',
            'binding.stats': 'Show Stats',
            'binding.trunk': 'Toggle Trunk',

            // close and do
            'binding.goBack': 'Back or X',
            'binding.doIt': 'Do It! or Use! (Enter)',
            'binding.doItSpace': 'Do It! or Use! (Spacebar)',
        };

        // Generate labeled settings inputs
        let settingsHTML = `
        <label><input type="checkbox" id="function.keybinding"> Enable Key Binding</label>
        
        <strong>Menu:</strong><br>
        ${[
            'binding.profile', 'binding.items', 'binding.cars', 'binding.skills', 'binding.perks', 'binding.bank', 'binding.wallet', 'binding.cards'
        ].map(key => `<label><input id="${key}" value="${keyBindingDefaults[key]}" maxlength="15"> ${keyBindingLabels[key]}</label>`).join('')}
        
        <br><strong>Navigation:</strong><br>
        ${[
            'binding.prevPage', 'binding.nextPage', 'binding.left', 'binding.right', 'binding.arrowLeft', 'binding.arrowRight'
        ].map(key => `<label><input id="${key}" value="${keyBindingDefaults[key]}" maxlength="15"> ${keyBindingLabels[key]}</label>`).join('')}
        
        <br><strong>Actions:</strong><br>
        ${[
            'binding.garage', 'binding.ship', 'binding.plates', 'binding.repair', 'binding.sell', 'binding.drop'
        ].map(key => `<label><input id="${key}" value="${keyBindingDefaults[key]}" maxlength="15"> ${keyBindingLabels[key]}</label>`).join('')}
        
        <br><strong>Special actions:</strong><br>
        ${[
            'binding.shot', 'binding.srepair', 'binding.sship', 'binding.ssell'
        ].map(key => `<label><input id="${key}" value="${keyBindingDefaults[key]}" maxlength="15"> ${keyBindingLabels[key]}</label>`).join('')}

        <br><strong>Driver and Car:</strong><br>
        ${[
            'binding.selectCar', 'binding.drive', 'binding.stats', 'binding.trunk'
        ].map(key => `<label><input id="${key}" value="${keyBindingDefaults[key]}" maxlength="15"> ${keyBindingLabels[key]}</label>`).join('')}
        
        <br><strong>Close & Do:</strong><br>
        ${[
            'binding.goBack', 'binding.doIt', 'binding.doItSpace'
        ].map(key => `<label><input id="${key}" value="${keyBindingDefaults[key]}" maxlength="15"> ${keyBindingLabels[key]}</label>`).join('')}
        `;

        settingsHTML += `
            <button id="resetKeybindings" style="margin-top: 10px;">Reset to Default</button>
            <div id="keyConflictWarning" style="color: red; font-size: 12px; display: none; margin-top: 4px;">
                ⚠ Duplicate keys detected!
            </div>
        `;

        newCrimeDiv.innerHTML = `
            <div class="container">
                <div class="right">
                    <div class="details">
                        <div class="name"><span>Key Binding</span></div>
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
                    <div class="crime-image" data-id="9997"><div></div></div>
                </div>
            </div>
        `;

        if (crimesContainer) {
            crimesContainer.appendChild(newCrimeDiv);
        }

        // Load settings from localStorage
        Object.entries(keyBindingDefaults).forEach(([key, def]) => {
            const el = document.getElementById(key);
            if (!el) return;

            const saved = localStorage.getItem(key);

            if (key === 'function.keybinding') {
                const value = saved !== null ? saved === 'true' : def;
                el.checked = value;
                if (saved === null) localStorage.setItem(key, value);

                el.addEventListener('change', () => {
                    localStorage.setItem(key, el.checked);
                });
            } else {
                const value = saved !== null ? saved : def;
                el.value = value;
                if (saved === null) localStorage.setItem(key, value);

                el.addEventListener('input', () => {
                    localStorage.setItem(key, el.value.toLowerCase());
                });
            }
        });

        // Conflict detection
        function checkForConflicts() {
            const inputs = document.querySelectorAll('.settings-wrapper input[type="text"]');
            const values = {};
            let conflictFound = false;

            inputs.forEach(input => {
                const val = input.value.trim().toLowerCase();
                if (val === '') return;
                if (values[val]) {
                    input.style.borderColor = 'red';
                    values[val].style.borderColor = 'red';
                    conflictFound = true;
                } else {
                    input.style.borderColor = '';
                    values[val] = input;
                }
            });

            const warning = document.getElementById('keyConflictWarning');
            if (warning) warning.style.display = conflictFound ? 'block' : 'none';
        }

        // Listen for input to detect key conflicts
        document.querySelectorAll('.settings-wrapper input[type="text"]').forEach(input => {
            input.addEventListener('input', checkForConflicts);
        });
        checkForConflicts(); // run once on load

        // Reset to defaults
        document.getElementById('resetKeybindings').addEventListener('click', () => {
            Object.entries(keyBindingDefaults).forEach(([key, def]) => {
                const el = document.getElementById(key);
                if (!el) return;

                if (key === 'function.keybinding') {
                    el.checked = def;
                } else {
                    el.value = def;
                }
                localStorage.setItem(key, def);
            });

            checkForConflicts();
        });

        // Add custom styles
        const style = document.createElement('style');
        style.textContent = `
            .crime[data-id="9997"] .reward-box::before {
                content: none !important;
            }
            .crime[data-id="9997"] .settings-wrapper {
                margin-top: 10px;
                margin-bottom: 10px;
                line-height: 1.6;
            }
            .crime[data-id="9997"] .settings-wrapper label {
                display: block;
                margin-bottom: 6px;
            }
            .crime[data-id="9997"] .settings-wrapper input[type="text"],
            .crime[data-id="9997"] .settings-wrapper input:not([type="checkbox"]) {
                width: 50px;
                max-width: 30%;
            }
        `;
        document.head.appendChild(style);
    });
});
