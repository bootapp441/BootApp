document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        // === 3. Create new Configuration crime box ===
        const crimesContainer = document.querySelector('.crimes-table .BL-content-inner-box.crimes-box .crimes');

        const newCrimeDiv = document.createElement('div');
        newCrimeDiv.className = 'crime BL-content BL-content-inner crime-configuration';
        newCrimeDiv.setAttribute('data-start-time', '0');
        newCrimeDiv.setAttribute('data-length', '0');
        newCrimeDiv.setAttribute('data-id', '9998');

        // Settings configuration
        const settingsHTML = `
            Energy parameters: <br>
            <label>&nbsp;All crimes cost <input type="number" id="crimeCost" min="5" max="200" step="5"> energy</label>
            <label>&nbsp;Don't go below <input type="number" id="minEnergy" min="5" max="600" step="5"> energy</label>
            <label>&nbsp;Energy refill between <input type="number" id="refillMin" min="0" max="600" step="5"> - <input type="number" id="refillMax" min="5" max="600" step="5"></label>
            <label><input type="checkbox" id="enableHalfTimers"> Enable Half Timers (If Blunt is activated)</label>
            <br>Energy consumption: <br>
            <label><input type="checkbox" id="enableBeer"> Enable Beer</label>
            <label><input type="checkbox" id="enableCoffee"> Enable Hotdog, Coffee and Beignets</label>
            <label><input type="checkbox" id="enableBanana"> Enable Banana</label>
            <br>Banana buy: <br>
            <label><input type="checkbox" id="enableBananaBuy"> Enable Banana buy in AC</label>
            <label>&nbsp;Buy Bananas if less then <input type="number" id="startBananaBuy" min="0" max="300" step="1"> left</label>
            <label>&nbsp;Keep <input type="number" id="availableSpace" min="0" max="300" step="1"> inventory space when buying Bananas</label>
            <br>Drinks: <br>
            <label><input type="checkbox" id="autoDrinkAC"> Enable drinks Speakeasy AC</label>
            <label><input type="checkbox" id="autoDrinkNYC"> Enable drinks Speakeasy NYC</label>
            <label><input type="checkbox" id="autoDrinkRM"> Enable drinks Speakeasy RM</label>
            <br>Crimes: <br>
            <label><input type="checkbox" id="enableDailyCrimes"> Enable auto toggle daily crimes</label>
            <br>Organized Crime: <br>
            <label><input type="checkbox" id="enableRocco"> Eat Meal at rocco, reduce OC Timer with 4hrs, if available</label>
            <label>&nbsp;No Rocco if OC timer is under <input type="number" id="enableOcSeconds" min="1" max="28800" step="60"> seconds</label>
            <label><input type="checkbox" id="enableApple"> Consume Apple until OC ready, .. </label>
            <label><input type="checkbox" id="enableApple2hrs"> .. not if timer < 2 hours</label>
            <label><input type="checkbox" id="enableApple4hrs"> .. not if timer < 4 hours</label>
            <label><input type="checkbox" id="enableApple6hrs"> .. not if timer < 6 hours</label>
            <br>Gym: <br>
            <label><input type="checkbox" id="enableExercise"> Exercise at Gym</label>
            <label><input type="checkbox" id="enableExercise.1"> Bench Press [ +100 Str ]</label>
            <label><input type="checkbox" id="enableExercise.2"> Heavy Bag [ +28 Str | +44 Sta | +28 Agi ]</label>
            <label><input type="checkbox" id="enableExercise.3"> Speed Bag [ +3 Str | +30 Sta | +67 Agi ]</label>
            <label><input type="checkbox" id="enableExercise.4"> Monkey Bars [ +50 Str | +17 Sta | +33 Agi ]</label>
            <label><input type="checkbox" id="enableExercise.5"> Dumbbells [ +66 Str | +17 Sta | +17 Agi ]</label>
            <label><input type="checkbox" id="enableExercise.7"> Beach Run [ +6 Str | +79 Sta | +15 Agi ]</label>
            <br>Jail: <br>
            <label>Use Adieu! until remaining <input type="number" id="enableJailAdieuAmount" min="1" max="20" step="1"></label>
            <br>House Keeping: <br>
            <label><input type="checkbox" id="houseKeepingSortEnabled"> Enable Auto Sorting </label>
            <label><input type="checkbox" id="houseKeepingGuns"> Clean Guns (Bat, Der., .31, Colt, Thomp.)</label>
            <label><input type="checkbox" id="houseKeepingBeer"> Clean 6 Pack of Beer | keep <input type="number" id="houseKeepingBeerKeep" min="0" max="600" step="1"></label>
            <label><input type="checkbox" id="houseKeepingCola"> Clean Cola | keep <input type="number" id="houseKeepingColaKeep" min="0" max="600" step="1"></label>
            <label><input type="checkbox" id="houseKeepingShiv"> Clean Shiv | keep <input type="number" id="houseKeepingShivKeep" min="0" max="600" step="1"></label>
            <label><input type="checkbox" id="houseKeepingLaud"> Clean Laudanum | keep <input type="number" id="houseKeepingLaudKeep" min="0" max="600" step="1"></label>
            <label><input type="checkbox" id="houseKeepingCigarettes"> Clean Cigarettes | keep <input type="number" id="houseKeepingCigarettesKeep" min="0" max="600" step="1"></label>
            <label><input type="checkbox" id="houseKeepingTrainTickets"> Clean Train Tickets | keep <input type="number" id="houseKeepingTrainTicketsKeep" min="0" max="600" step="1"></label>
            <label><input type="checkbox" id="houseKeepingPopcorn"> Clean Popcorn</label>
            <label><input type="checkbox" id="houseKeepingStamps"> Open Stamp Pack</label>
            <label><input type="checkbox" id="houseKeepingLootbox"> Open Loot Box</label>  
            <br>Auto Cleaning (50 % it triggers on page load): <br>
            <label><input type="checkbox" id="autoCleanCrimes"> Enable Auto Clean on Crimes Page</label>
            <label><input type="checkbox" id="autoCleanRackets"> Enable Auto Clean on Rackets Page</label>
            <label><input type="checkbox" id="autoCleanForums"> Enable Auto Clean on Forum Spike Topic (616827)</label>
        `;

        newCrimeDiv.innerHTML = `
            <div class="container">
                <div class="right">
                    <div class="details">
                        <div class="name"><span>Configure Gameplay</span></div>
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
                    <div class="crime-image" data-id="9998"><div></div></div>
                </div>
            </div>
        `;

        if (crimesContainer) {
            crimesContainer.appendChild(newCrimeDiv);
        }

        // === 4. Load settings from localStorage ===
        const settings = [
            { id: 'crimeCost', type: 'number', default: 10 },
            { id: 'minEnergy', type: 'number', default: 95 },
            { id: 'enableHalfTimers', type: 'checkbox', default: false },
            { id: 'enableBanana', type: 'checkbox', default: true },
            { id: 'enableBananaBuy', type: 'checkbox', default: false },
            { id: 'startBananaBuy', type: 'number', default: 30 },
            { id: 'availableSpace', type: 'number', default: 25 },
            { id: 'refillMin', type: 'number', default: 0 },
            { id: 'refillMax', type: 'number', default: 170 },
            { id: 'enableBeer', type: 'checkbox', default: true },
            { id: 'enableCoffee', type: 'checkbox', default: true },
            { id: 'enableDailyCrimes', type: 'checkbox', default: true },
            { id: 'enableRocco', type: 'checkbox', default: false },
            { id: 'enableOcSeconds', type: 'number', default: 16200 }, // 4.5 hrs
            { id: 'enableApple', type: 'checkbox', default: false },
            { id: 'enableApple2hrs', type: 'checkbox', default: true },
            { id: 'enableApple4hrs', type: 'checkbox', default: false },
            { id: 'enableApple6hrs', type: 'checkbox', default: false },
            { id: 'autoDrinkAC', type: 'checkbox', default: true },
            { id: 'autoDrinkNYC', type: 'checkbox', default: true },
            { id: 'autoDrinkRM', type: 'checkbox', default: true },
            { id: 'enableJailAdieuAmount', type: 'number', default: 3 },
            { id: 'houseKeepingSortEnabled', type: 'checkbox', default: true },
            { id: 'houseKeepingGuns', type: 'checkbox', default: true },
            { id: 'houseKeepingBeer', type: 'checkbox', default: true },
            { id: 'houseKeepingBeerKeep', type: 'number', default: 6 },
            { id: 'houseKeepingCola', type: 'checkbox', default: true },
            { id: 'houseKeepingColaKeep', type: 'number', default: 6 },
            { id: 'houseKeepingShiv', type: 'checkbox', default: true },
            { id: 'houseKeepingShivKeep', type: 'number', default: 6 },
            { id: 'houseKeepingLaud', type: 'checkbox', default: true },
            { id: 'houseKeepingLaudKeep', type: 'number', default: 6 },
            { id: 'houseKeepingCigarettes', type: 'checkbox', default: true },
            { id: 'houseKeepingCigarettesKeep', type: 'number', default: 6 },
            { id: 'houseKeepingTrainTickets', type: 'checkbox', default: true },
            { id: 'houseKeepingTrainTicketsKeep', type: 'number', default: 30 },
            { id: 'houseKeepingPopcorn', type: 'checkbox', default: false },
            { id: 'houseKeepingStamps', type: 'checkbox', default: true },
            { id: 'houseKeepingLootbox', type: 'checkbox', default: true },
            { id: 'enableExercise', type: 'checkbox', default: false },
            { id: 'enableExercise.1', type: 'checkbox', default: true },
            { id: 'enableExercise.2', type: 'checkbox', default: true },
            { id: 'enableExercise.3', type: 'checkbox', default: true },
            { id: 'enableExercise.4', type: 'checkbox', default: true },
            { id: 'enableExercise.5', type: 'checkbox', default: true },
            { id: 'enableExercise.7', type: 'checkbox', default: true },
            { id: 'autoCleanCrimes', type: 'checkbox', default: false },
            { id: 'autoCleanRackets', type: 'checkbox', default: false },
            { id: 'autoCleanForums', type: 'checkbox', default: false },
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
            .crime[data-id="9998"] .reward-box::before {
                content: none !important;
            }
            .crime[data-id="9998"] .settings-wrapper {
                margin-top: 10px;
                margin-bottom: 10px;
                line-height: 1.6;
            }
            .crime[data-id="9998"] .settings-wrapper label {
                display: block;
                margin-bottom: 6px;
            }
        `;
        document.head.appendChild(style);
    });
});
