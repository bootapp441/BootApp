document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        // === STAMP FILLING ===
        const stampRadio = document.querySelector('#radio8');
        if (stampRadio) {
            const stampLabel = stampRadio.closest('.checkbox').querySelector('label');
            const fillButton = document.createElement('span');
            fillButton.textContent = ' [Fill Stamps]';
            Object.assign(fillButton.style, {
                cursor: 'pointer', color: '#00c8ff', textDecoration: 'underline',
                marginLeft: '6px', fontSize: 'small'
            });
            stampLabel.appendChild(fillButton);

            let filledIndex = 0;

            fillButton.addEventListener('click', function () {
                stampRadio.click();
                const inputs = Array.from(document.querySelectorAll('.my-stamps input[type="number"]'));
                let filled = 0;
                for (let i = filledIndex; i < inputs.length && filled < 10; i++) {
                    const side = inputs[i].closest('.stamp').querySelector('.side-left');
                    const match = side.querySelector('.color-off')?.textContent?.match(/Available: (\d+)/);
                    const available = match ? parseInt(match[1], 10) : 0;
                    if (available > 1) {
                        inputs[i].value = available - 1;
                        filled++;
                    }
                    filledIndex = i + 1;
                }

                const addBtn = Array.from(document.querySelectorAll('input[type="submit"], button'))
                    .find(btn => btn.value?.toLowerCase() === 'add!' || btn.textContent?.trim().toLowerCase() === 'add!');
                if (addBtn) setTimeout(() => addBtn.click(), 100);

                if (filledIndex >= inputs.length) {
                    fillButton.textContent = ' [All stamps filled]';
                    fillButton.style.color = 'gray';
                    fillButton.style.cursor = 'default';
                    fillButton.style.textDecoration = 'none';
                }
            });
        }

        // === CAR SELECTION ===
        const valueCars = [
            "Bernardi Model CE", "Castillon V16", "Martinez-Bauer 431 Supercharged Roadster",
            "Rosenberg Type RS Boattail Speedster"
        ];

        const heavyCars = [
            "Hudson V12", "Barrett 480", "Castillon V16",
            "Hudson V12 Limousine", "Braxton 8 Litre", "Maynard 384 Speedster", "Castillon V16 Roadster",
            "Everett Series R 7-Passenger Touring", "Clausen Royal Close Coupled Sedan", "Maynard V12"
        ];

        const scrapCars = [
            "Phaeton", "Braxton 8L", "Model 6", "Porter V8",
            "Chalamet Pickup", "Police Car", "Auclair Type-3 GSS", "Chalamet Alliance Phaeton",
            "Porter Model 6 Touring", "Porter Model 11 Touring", "Harlow-Ryder Model S35",
            "Swift Model 96", "Chalamet Liberty 1/2 Ton Pickup", "Porter Model 1 Tudor", "Asher 26-6"
        ];

        const closedCabCars = [
            "Porter Model 1 Closed Cab"
        ];

        const boozeCars = [
            "Milk Truck", "Hearse", "School Bus", "Porter Model 1 Closed Cab"
        ];
        const carSection = document.querySelector('.my-cars');
        if (carSection) {
            const label = document.querySelector('#radio3')?.closest('.checkbox')?.querySelector('label');

            const makeBtn = (text, cb) => {
                const b = document.createElement('span');
                b.textContent = ` [${text}]`;
                Object.assign(b.style, {
                    cursor: 'pointer', color: '#00c8ff', textDecoration: 'underline',
                    marginLeft: '6px', fontSize: 'small'
                });
                b.addEventListener('click', cb);
                return b;
            };

            const selectCars = (list) => {
                const carRadio = document.querySelector('#radio3');
                if (!carRadio) return;

                // Step 1: Select the "Car" radio first
                carRadio.click();

                // Add slight delay to ensure any radio onclick handlers like `highlightItem` finish first
                setTimeout(() => {
                    // Step 2: Clear any previously checked boxes
                    carSection.querySelectorAll('input.car_plate[type="checkbox"]').forEach(cb => cb.checked = false);

                    // Step 3: Select matching cars
                    let selected = 0;
                    carSection.querySelectorAll('li.car').forEach(li => {
                        const detailsDiv = li.querySelector('.car-details');
                        const checkbox = li.querySelector('input.car_plate[type="checkbox"]');
                        if (!detailsDiv || !checkbox) return;

                        // Remove damage span to get just the car name
                        const cloned = detailsDiv.cloneNode(true);
                        const damageSpan = cloned.querySelector('span');
                        if (damageSpan) cloned.removeChild(damageSpan);
                        const carName = cloned.textContent.trim();

                        if (list.includes(carName)) {
                            checkbox.checked = true;
                            selected++;
                        }
                    });

                    // Step 4: Delay again before clicking Add!
                    if (selected > 0) {
                        setTimeout(() => {
                            const addBtn = Array.from(document.querySelectorAll('input[type="submit"], button'))
                                .find(btn => btn.value?.toLowerCase() === 'add!' || btn.textContent?.trim().toLowerCase() === 'add!');
                            if (addBtn) addBtn.click();
                        }, 100); // 100ms after selecting cars
                    }
                }, 100); // 100ms after selecting radio
            }; 
            label.appendChild(makeBtn('Value Cars', () => selectCars(valueCars)));
            label.appendChild(makeBtn('Heavy Cars', () => selectCars(heavyCars)));
            label.appendChild(makeBtn('Scrap Cars', () => selectCars(scrapCars)));
            label.appendChild(makeBtn('Closed Cab', () => selectCars(closedCabCars)));
            label.appendChild(makeBtn('Booze Cars', () => selectCars(boozeCars)));

        }

        // === MONEY 95% AUTO-FILL ===
        const moneyRadio = document.querySelector('#radio1');
        const moneyLabel = moneyRadio?.closest('tr')?.querySelector('label');
        const moneyInput = document.querySelector('input[name="money_amt"]');

        if (moneyLabel && moneyInput) {
            const moneyBtn = document.createElement('span');
            moneyBtn.textContent = ' [Add 95% Money]';
            Object.assign(moneyBtn.style, {
                cursor: 'pointer', color: '#00c8ff', textDecoration: 'underline',
                marginLeft: '6px', fontSize: 'small'
            });

            moneyLabel.appendChild(moneyBtn);

            moneyBtn.addEventListener('click', function () {
                const cashElement = document.querySelector('[data-player-stat="cash"]');
                const fullAmount = cashElement ? parseInt(cashElement.dataset.amount, 10) : 0;
                const moneyValue = Math.floor(fullAmount * 0.95);

                if (moneyValue > 0) {
                    moneyRadio.click();
                    // moneyInput.value = moneyValue.toLocaleString('en-US'); // Format with commas
                    moneyInput.value = moneyValue;
                    const addBtn = Array.from(document.querySelectorAll('input[type="submit"], button'))
                        .find(btn => btn.value?.toLowerCase() === 'add!' || btn.textContent?.trim().toLowerCase() === 'add!');
                    if (addBtn) setTimeout(() => addBtn.click(), 100);
                }
            });
        }

        // === MONEY $25M AUTO-FILL ===
        const money25Btn = document.createElement('span');
        money25Btn.textContent = ' [Add $25M]';
        Object.assign(money25Btn.style, {
            cursor: 'pointer', color: '#00c8ff', textDecoration: 'underline',
            marginLeft: '6px', fontSize: 'small'
        });
        moneyLabel.appendChild(money25Btn);

        money25Btn.addEventListener('click', function () {
            const value = 25000000;
            moneyRadio.click();
            //moneyInput.value = value.toLocaleString('en-US'); // Format with commas
            moneyInput.value = value;
            const addBtn = Array.from(document.querySelectorAll('input[type="submit"], button'))
                .find(btn => btn.value?.toLowerCase() === 'add!' || btn.textContent?.trim().toLowerCase() === 'add!');
            if (addBtn) setTimeout(() => addBtn.click(), 100);
        });

        // === GOLD AUTO-FILL ===
        const goldRadio = document.querySelector('#radio2');
        const goldLabel = goldRadio?.closest('tr')?.querySelector('label');
        const goldInput = document.querySelector('input[name="points_amt"]');

        if (goldLabel && goldInput) {
            const goldBtn = document.createElement('span');
            goldBtn.textContent = ' [Add All Gold]';
            Object.assign(goldBtn.style, {
                cursor: 'pointer', color: '#00c8ff', textDecoration: 'underline',
                marginLeft: '6px', fontSize: 'small'
            });

            goldLabel.appendChild(goldBtn);

            goldBtn.addEventListener('click', function () {
                const goldElement = document.querySelector('[data-player-stat="gold"]');
                const goldValue = goldElement ? parseInt(goldElement.dataset.amount, 10) : 0;
                if (goldValue > 0) {
                    goldRadio.click();
                    goldInput.value = goldValue;
                    const addBtn = Array.from(document.querySelectorAll('input[type="submit"], button'))
                        .find(btn => btn.value?.toLowerCase() === 'add!' || btn.textContent?.trim().toLowerCase() === 'add!');
                    if (addBtn) setTimeout(() => addBtn.click(), 100);
                }
            });
        }
    });
});
