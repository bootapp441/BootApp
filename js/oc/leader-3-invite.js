document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {

        function isLeaderModeEnabled() {
            return localStorage.getItem('oc.leader.mode') === 'true';
        }

        function getParticipants() {
            const raw = localStorage.getItem('oc.leader.participants') || '';
            const lines = raw.split('\n').map(line => line.trim()).filter(Boolean);

            const parsed = [];

            lines.forEach(line => {
                const [name, role] = line.split(':');
                if (name && role) {
                    parsed.push({ name: name.trim(), role: role.trim().toLowerCase() });
                }
            });

            return parsed;
        }

        function pickRandom(arr, count) {
            const shuffled = arr.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        }

        function getOccupiedRolesAndNames() {
            const occupiedRoles = new Set();
            const occupiedNames = new Set();

            $('td.member-info').each(function () {
                const roleText = $(this).find('b').first().text().trim();
                const userLink = $(this).closest('td').prevAll('.header.member-header').find('a').text().trim();

                if (['Driver', 'Explosives expert', 'Weapons expert'].includes(roleText)) {
                    occupiedRoles.add(roleText);
                }

                if (userLink && userLink.toLowerCase() !== 'none') {
                    occupiedNames.add(userLink.toLowerCase());
                }
            });

            return { occupiedRoles, occupiedNames };
        }

        function assignRoles(participantList) {
            const roleLabels = ['Driver', 'Explosives expert', 'Weapons expert'];
            const roleMap = { 'dr': '4', 'ee': '3', 'we': '2' };
            const roleLabelMap = { 'dr': 'Driver', 'ee': 'Explosives expert', 'we': 'Weapons expert' };

            const { occupiedRoles, occupiedNames } = getOccupiedRolesAndNames();

            const assignments = [];
            const usedNames = new Set();

            for (const { name, role } of participantList) {
                const lname = name.toLowerCase();
                if (occupiedNames.has(lname) || usedNames.has(lname)) continue;

                if (role === '*') {
                    for (const fallbackRole of ['dr', 'ee', 'we']) {
                        const roleLabel = roleLabelMap[fallbackRole];
                        if (!occupiedRoles.has(roleLabel)) {
                            assignments.push({ name, role: roleMap[fallbackRole], roleLabel });
                            occupiedRoles.add(roleLabel); // mark role as filled
                            usedNames.add(lname); // mark user as used
                            break;
                        }
                    }
                } else if (['dr', 'ee', 'we'].includes(role)) {
                    const roleLabel = roleLabelMap[role];
                    if (!occupiedRoles.has(roleLabel)) {
                        assignments.push({ name, role: roleMap[role], roleLabel });
                        occupiedRoles.add(roleLabel);
                        usedNames.add(lname);
                    }
                }
            }

            return assignments;
        }

        function tryInviteParticipants() {
            const finalizeButton = $('input[type="submit"][name="finalize_percents"][value="Finalize percents!"]');
            if (finalizeButton.length) {
                console.log('[OC-L-Invite] Finalize button present — not ready to invite.');
                return;
            }

            const participants = getParticipants();
            if (participants.length < 3) {
                console.warn('[OC-L-Invite] Not enough participants in config to invite.');
                return;
            }

            const { occupiedNames } = getOccupiedRolesAndNames();

            const filteredParticipants = participants.filter(p =>
                p.name && !occupiedNames.has(p.name.toLowerCase())
            );

            const assigned = assignRoles(filteredParticipants);

            if (assigned.length === 0) {
                console.log('[OC-L-Invite] No roles left to assign or no eligible participants available.');
                return;
            }

            let assignIndex = 0;
            for (let pos = 2; pos <= 4; pos++) {
                const usernameInput = $(`input[name="iusername[${pos}]"]`);
                const roleSelect = $(`select[name="iposition[${pos}]"]`);

                if (!usernameInput.length || !roleSelect.length) {
                    console.log(`[OC-L-Invite] Skipping position ${pos} — already filled.`);
                    continue;
                }

                if (assignIndex >= assigned.length) {
                    console.log('[OC-L-Invite] All available participants assigned.');
                    break;
                }

                const user = assigned[assignIndex++];
                usernameInput.val(user.name);
                roleSelect.val(user.role);
                console.log(`[OC-L-Invite] Assigned ${user.name} as ${user.roleLabel} in position ${pos}`);
            }

            const inviteBtn = $('input[type="submit"][value="Invite member(s)!"]');
            if (inviteBtn.length) {
                console.log('[OC-L-Invite] Clicking "Invite member(s)!" button...');
                inviteBtn.trigger('click'); // ✅ enable when ready
            } else {
                console.warn('[OC-L-Invite] Invite button not found.');
            }
        }

        // === Delay execution to allow page elements to render ===
        const delay = Math.floor(Math.random() * 3000) + 2000;
        console.log(`[OC-L-Invite] Waiting ${delay}ms before attempting invite...`);

        setTimeout(() => {
            if (!isLeaderModeEnabled()) {
                console.log('[OC-L-Invite] Leader mode OFF — skipping invites.');
                return;
            }

            const doItBtn = $('input[type="submit"][name="createcrime"]');
            if (doItBtn.length) {
                console.log('[OC-L-Invite] "Do it!" button still visible — crime has not been initiated yet. Skipping invite.');
                return;
            }

            tryInviteParticipants();
        }, delay);

    });
});
