document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        // === 3. Create new Configuration crime box ===
        const crimesContainer = document.querySelector('.crimes-table .BL-content-inner-box.crimes-box .crimes');

        const newCrimeDiv = document.createElement('div');
        newCrimeDiv.className = 'crime BL-content BL-content-inner crime-configuration';
        newCrimeDiv.setAttribute('data-start-time', '0');
        newCrimeDiv.setAttribute('data-length', '0');
        newCrimeDiv.setAttribute('data-id', '9993');

        // Settings configuration
        const settingsHTML = `
            <label><input type="checkbox" id="oc.refresh"> Auto refresh OC page every <input type="number" id="oc.refresh.seconds" min="1" max="28800" step="30"> seconds (1 minute offset)</label>
            Leader: <br>
            <label><input type="checkbox" id="oc.leader.mode"> Leader Mode</label>
            <label><input type="checkbox" id="oc.leader.autoTravel"> Auto train travel to lead in city if OC timer is ready:</label>
            <label>
            OC Leading enabled in Cities:
            <label><input type="checkbox" id="oc.leader.city.CIN"> CIN</label>
            <label><input type="checkbox" id="oc.leader.city.NYC"> NYC</label>
            <label><input type="checkbox" id="oc.leader.city.CHI"> CHI</label>
            <label><input type="checkbox" id="oc.leader.city.NO"> NO</label>
            <label><input type="checkbox" id="oc.leader.city.AC"> AC</label>
            <label><input type="checkbox" id="oc.leader.city.DT"> DT</label>
            </label>
            <label>Possible participants (format: username:role — dr, ee, we, or *):</label>
                <textarea id="oc.leader.participants" rows="9" style="width:100%">username1:dr
                username2:ee
                username3:we
                username4:dr
                username5:ee
                username6:we
                username7:*
                username8:*
                username9:*</textarea>
            <label>Set share percentage: <input type="text" id="oc.leader.share" placeholder="25:25:25:25"></label>
            <label><input type="checkbox" id="oc.leader.splitEvenly"> Split evenly</label>
            <br>Participant: <br>
            <label><input type="checkbox" id="oc.participant.mode"> Participant Mode</label>
            <label>Options:</label>
            <label><input type="checkbox" id="oc.participant.autoTravel"> Auto train travel to OC states if ready to join</label>
            <label><input type="checkbox" id="oc.participant.autoJoin"> Auto join OC invitation </label>
            <label><input type="checkbox" id="oc.participant.autoEquip"> Auto equip procedure per role (Car/Bar/Explosive)</label>
            <label><input type="checkbox" id="oc.participant.autoReady"> Auto final check up and ready</label>
        `;

        newCrimeDiv.innerHTML = `
            <div class="container">
                <div class="right">
                    <div class="details">
                        <div class="name"><span>Organized Crime [NOT FINISHED]</span></div>
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
                    <div class="crime-image" data-id="9993"><div></div></div>
                </div>
            </div>
        `;

        if (crimesContainer) {
            crimesContainer.appendChild(newCrimeDiv);
        }

        // === 4. Load settings from localStorage ===
        const settings = [
            { id: 'oc.refresh', type: 'checkbox', default: false },
            { id: 'oc.refresh.seconds', type: 'number', default: 180 },
            { id: 'oc.leader.mode', type: 'checkbox', default: false },
            { id: 'oc.leader.autoTravel', type: 'checkbox', default: true },
            { id: 'oc.leader.city.CIN', type: 'checkbox', default: true },
            { id: 'oc.leader.city.NYC', type: 'checkbox', default: true },
            { id: 'oc.leader.city.CHI', type: 'checkbox', default: true },
            { id: 'oc.leader.city.NO', type: 'checkbox', default: true },
            { id: 'oc.leader.city.AC', type: 'checkbox', default: true },
            { id: 'oc.leader.city.DT', type: 'checkbox', default: true },
            { id: 'oc.leader.participants', type: 'text', default: 'username1:dr\nusername2:ee\nusername3:we\nusername4:dr\nusername5:ee\nusername6:we\nusername7:*\nusername8:*\nusername9:*' },
            { id: 'oc.leader.share', type: 'text', default: '25:25:25:25' },
            { id: 'oc.leader.splitEvenly', type: 'checkbox', default: false },
            { id: 'oc.leader.commit', type: 'checkbox', default: false },
            { id: 'oc.participant.mode', type: 'checkbox', default: false },
            { id: 'oc.participant.autoTravel', type: 'checkbox', default: false },
            { id: 'oc.participant.autoJoin', type: 'checkbox', default: false },
            { id: 'oc.participant.autoEquip', type: 'checkbox', default: false },
            { id: 'oc.participant.autoReady', type: 'checkbox', default: false },
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

        // === 4b. Enforce mutual exclusivity between Leader and Participant modes ===
        // === Enforce mutually exclusive selection of enabled cities ===
        const cityCheckboxIds = [
            'oc.leader.city.CIN',
            'oc.leader.city.NYC',
            'oc.leader.city.RM',
            'oc.leader.city.CHI',
            'oc.leader.city.NO',
            'oc.leader.city.AC',
            'oc.leader.city.DT'
        ];

        cityCheckboxIds.forEach(id => {
            const checkbox = document.getElementById(id);
            if (!checkbox) return;

            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    cityCheckboxIds.forEach(otherId => {
                        if (otherId !== id) {
                            const otherCheckbox = document.getElementById(otherId);
                            if (otherCheckbox) {
                                otherCheckbox.checked = false;
                                localStorage.setItem(otherId, false);
                            }
                        }
                    });
                }

                localStorage.setItem(id, checkbox.checked);
            });
        });

        const leaderModeEl = document.getElementById('oc.leader.mode');
        const participantModeEl = document.getElementById('oc.participant.mode');

        // helper function to sync checkboxes
        function syncExclusiveModes(source, target, sourceKey, targetKey) {
            if (source.checked) {
                target.checked = false;
                localStorage.setItem(targetKey, false);
            }
            localStorage.setItem(sourceKey, source.checked);
        }

        // Setup listeners
        if (leaderModeEl && participantModeEl) {
            leaderModeEl.addEventListener('change', () =>
                syncExclusiveModes(leaderModeEl, participantModeEl, 'oc.leader.mode', 'oc.participant.mode')
            );

            participantModeEl.addEventListener('change', () =>
                syncExclusiveModes(participantModeEl, leaderModeEl, 'oc.participant.mode', 'oc.leader.mode')
            );

            // Trigger once to enforce logic on initial load
            if (leaderModeEl.checked) {
                participantModeEl.checked = false;
                localStorage.setItem('oc.participant.mode', false);
            }
            if (participantModeEl.checked) {
                leaderModeEl.checked = false;
                localStorage.setItem('oc.leader.mode', false);
            }
        }


        // === 5. Add custom styles ===
        const style = document.createElement('style');
        style.textContent = `
            .crime[data-id="9993"] .reward-box::before {
                content: none !important;
            }
            .crime[data-id="9993"] .settings-wrapper {
                margin-top: 10px;
                margin-bottom: 10px;
                line-height: 1.6;
            }
            .crime[data-id="9993"] .settings-wrapper label {
                display: block;
                margin-bottom: 6px;
            }
        `;
        document.head.appendChild(style);
    });
});
