document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(async function () {

        if (location.pathname === "/events/hot-dog-eating-contest.php") return;

        /* =================== Config =================== */
        const CAPSOLVER_ENABLED = (localStorage.getItem('capsolver.enabled') || 'false') === 'true';

        const BLOCK_DURATION = parseInt(localStorage.getItem('captcha.blockDuration')) || 120000;
        const POLL_INTERVAL = 2000;
        const GRACE_PERIOD_MS = 10000;

        const DETECTED_TIME = 'captcha.DetectedTime';
        const SENT_FLAG = 'captcha.sent';
        const SOLVING_FLAG = 'captcha.solving';
        const SOLVING_STARTED_AT = 'captcha.solvingStartedAt';

        let isReloading = false;

        const LAST_MONITOR_HOOK = 'captcha.lastMonitorWebhook';
        const MONITOR_THROTTLE_MS = 10 * 60 * 1000; // 10 minutes


        /* =================== API & Keys =================== */
        const CAPS_API_KEY = localStorage.getItem('capsolver.api.key');
        const SITE_KEY = getSiteKeyFromInlineScript() || '6LeplqUlAAAAADD_vdYJRfzMtaBpZ9ZErfETYCI0';
        const PAGE_URL = window.location.href;

        if (Date.now() - (parseInt(localStorage.getItem(SOLVING_STARTED_AT) || '0')) > BLOCK_DURATION) {
            clearSolving();
        }

        /* =================== Webhooks =================== */
        function getUsername() {
            const usernameDiv = document.querySelector('.character-container .username a');
            return usernameDiv ? usernameDiv.textContent.trim().substring(0, 3) : 'unknown';
        }

        function getUserWebhook(username) {
            const webhookFromStorage = localStorage.getItem('discord.webhook.3'); // Captcha messages = webhook #3
            const discordEnabled = localStorage.getItem('discord.enabled') === 'true';

            if (!discordEnabled || !webhookFromStorage) {
                console.warn(`Discord disabled or webhook.3 missing – skipping webhook for ${username}`);
                return null;
            }

            return webhookFromStorage;
        }

        async function sendWebhook(S, message, color) {
            const webhookUrl = getUserWebhook(username);
            if (!webhookUrl) return;

            return $.post({
                url: webhookUrl,
                contentType: 'application/json',
                data: JSON.stringify({ embeds: [{ description: message, color: color }] })
            });

        }

        /* =================== Solver =================== */
        async function solveCaptcha() {
            const username = getUsername();
            const solveStart = Date.now();
            const taskReq = {
                clientKey: CAPS_API_KEY,
                task: { type: "RecaptchaV2TaskProxyless", websiteURL: PAGE_URL, websiteKey: SITE_KEY }
            };

            try {
                const createRes = await fetch("https://api.capsolver.com/createTask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(taskReq) }).then(r => r.json());
                if (!createRes.taskId) { await sendWebhook(username, `CapSolver error: ${JSON.stringify(createRes)}`, 0xFF0000); return null; }
                await sendWebhook(username, `CapSolver task created (taskId: ${createRes.taskId})`, 0x0000FF);

                while (true) {
                    await new Promise(r => setTimeout(r, POLL_INTERVAL));
                    const result = await fetch("https://api.capsolver.com/getTaskResult", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clientKey: CAPS_API_KEY, taskId: createRes.taskId }) }).then(r => r.json());

                    if (result.status === "ready") {
                        const solveEnd = Date.now();
                        const durationSeconds = ((solveEnd - solveStart) / 1000).toFixed(2);
                        await sendWebhook(username, `CAPTCHA token received. Solved in ${durationSeconds}s`, 0x00FF00);
                        return result.solution.gRecaptchaResponse;
                    }
                    if (result.status !== "processing") {
                        console.warn("Unexpected status:", result);
                        return null;
                    }
                }
            } catch (err) { console.error(err); return null; }
        }

        /* =================== Submit =================== */
        async function submitSolvedToken(token) {
            const username = getUsername();
            await sendWebhook(username, `CAPTCHA submitted, awaiting validation.`, 0x00FF00);

            const isGymPage = window.location.pathname === '/gym.php';

            let res;

            if (isGymPage) {
                // Special case: gym page needs a different endpoint and payload
                res = await fetch("https://www.bootleggers.us/ajax/gym.php?action=exercise", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    credentials: "include",
                    body: `gym_id=1&exercise_id=1&token=${encodeURIComponent(token)}`
                }).then(r => r.json());
            } else {
                // Default CAPTCHA verification endpoint
                res = await fetch("https://www.bootleggers.us/ajax/player.php?action=verify-captcha", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    credentials: "include",
                    body: "token=" + encodeURIComponent(token)
                }).then(r => r.json());
            }

            if (res.valid || res.success) {
                await sendWebhook(username, `CAPTCHA solved successfully: ${username}`, 0x00FF00);
                localStorage.setItem('captcha.reload', Date.now());
                isReloading = true;
                clearSolving();
                setTimeout(() => location.reload(), 2000);
            } else {
                await sendWebhook(username, `CAPTCHA submit failed: ${JSON.stringify(res)}`, 0xFF0000);
                isReloading = true;
                clearSolving();
                setTimeout(() => location.reload(), 2000);
            }
        }

        /* =================== Observer =================== */
        const observer = new MutationObserver(() => updateCaptchaStatus());
        observer.observe(document.body, { childList: true, subtree: true });
        updateCaptchaStatus();

        function isCaptchaPresent() {
            return !!document.querySelector('.g-recaptcha, iframe[src*="recaptcha"], iframe[title="reCAPTCHA"]');
        }

        async function updateCaptchaStatus() {
            const now = Date.now();
            const storedTime = parseInt(localStorage.getItem(DETECTED_TIME) || '0', 10);
            const username = getUsername();

            if (!isCaptchaPresent() || isReloading) return;

            // If capsolver.enabled is false => do Monitor-Only approach
            if (!CAPSOLVER_ENABLED) {
                const lastSent = parseInt(localStorage.getItem(LAST_MONITOR_HOOK) || '0', 10);

                if (!storedTime || (now - storedTime) >= BLOCK_DURATION) {
                    // New block
                    console.log('[Monitor] CAPTCHA detected, starting new block.');
                    localStorage.setItem(DETECTED_TIME, now.toString());
                    localStorage.setItem(SENT_FLAG, 'true');

                    // ✅ Webhook throttled
                    if (now - lastSent >= MONITOR_THROTTLE_MS) {
                        await sendWebhook(username, `CAPTCHA pending (monitor-only): ${username}`, 0xFF0000);
                        localStorage.setItem(LAST_MONITOR_HOOK, now.toString());
                    } else {
                        console.log('[Monitor] Webhook throttled.');
                    }

                    // ✅ Always reload after block duration
                    setTimeout(() => location.reload(), BLOCK_DURATION);

                } else if (!localStorage.getItem(SENT_FLAG)) {
                    // Within block, but no SENT_FLAG yet
                    localStorage.setItem(SENT_FLAG, 'true');

                    if (now - lastSent >= MONITOR_THROTTLE_MS) {
                        await sendWebhook(username, `CAPTCHA still pending (monitor-only): ${username}`, 0xFF0000);
                        localStorage.setItem(LAST_MONITOR_HOOK, now.toString());
                    } else {
                        console.log('[Monitor] Webhook throttled (re-detection).');
                    }
                }

                return; // end monitor logic
            }


            // ✅ Global solve lock (all tabs respect it)
            if (localStorage.getItem(SOLVING_FLAG) === 'true') {
                console.log('[Observer] CAPTCHA solving already in progress.');
                return;
            }

            // ✅ Block window check (cooldown mechanism)
            if (storedTime && (now - storedTime) < BLOCK_DURATION) {
                console.log('[Observer] CAPTCHA block window active, skipping.');
                return;
            }

            // === Mark block
            localStorage.setItem(DETECTED_TIME, now.toString());
            localStorage.setItem(SENT_FLAG, 'true');
            localStorage.setItem(SOLVING_FLAG, 'true');
            localStorage.setItem(SOLVING_STARTED_AT, Date.now().toString());

            // ✅ First detection
            if (!localStorage.getItem("captcha.observed")) {
                localStorage.setItem("captcha.observed", "true");
                await sendWebhook(username, `CAPTCHA detected on page: ${PAGE_URL}`, 0x800080);
            }

            // === Notify
            await sendWebhook(username, `CAPTCHA pending: ${username}`, 0xFF0000);

            // === Optional: notify other tabs to pause actions
            localStorage.setItem("captcha.solveBroadcast", Date.now());

            // === Optional: stop observer temporarily to prevent weird double entries during long solves
            observer.disconnect();

            // === Solve
            const solvedToken = await solveCaptcha();

            if (solvedToken) {
                await submitSolvedToken(solvedToken);
            } else {
                // optional fallback
                console.warn('[Observer] No token received, reconnecting observer.');
                observer.observe(document.body, { childList: true, subtree: true });
            }
        }

        /* =================== Broadcast Handler =================== */
        window.addEventListener("storage", async function (e) {
            if (e.key === 'captcha.reload') {
                if (isCaptchaPresent() && !isReloading && Date.now() - parseInt(e.newValue) < GRACE_PERIOD_MS) {
                    const username = getUsername();
                    await sendWebhook(username, `Forced reload due to CAPTCHA box present on: ${PAGE_URL}`, 0xFFA500);
                    observer.disconnect();
                    clearSolving();
                    setTimeout(() => location.reload(), 200);
                }
            }
        });

        function clearSolving() {
            localStorage.removeItem(SOLVING_FLAG);
            localStorage.removeItem(SOLVING_STARTED_AT);
            localStorage.removeItem(DETECTED_TIME);
            localStorage.removeItem(SENT_FLAG);
            localStorage.removeItem("captcha.observed");
        }

        function getSiteKeyFromInlineScript() {
            const scripts = document.querySelectorAll('script');
            for (let s of scripts) if (s.textContent.includes('BL.init(')) try {
                return JSON.parse(s.textContent.match(/BL\.init\((\{.*\})\)/s)[1]).reCAPTCHAv2SiteKey || null;
            } catch (err) { console.error(err); return null; }
            return null;
        }

    });
});