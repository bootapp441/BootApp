document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        const webhookUrl = localStorage.getItem('discord.webhook.4'); // Stats webhook
        const discordEnabled = localStorage.getItem('discord.enabled') === 'true';

        // Get the current date and time in the format MM/DD/YYYY HH:MM
        const now = new Date();
        const dateString = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        // Select the rows where "Cash On Hand" and "Bank Accounts" are located, then grab the value from the second <td>
        const cashOnHand = $('tr.sub3:has(td:contains("Cash On Hand")) td:nth-child(2)').text().trim();
        const bankAccounts = $('tr.sub3:has(td:contains("Bank Accounts")) td:nth-child(2)').text().trim();

        console.log("Cash On Hand:", cashOnHand);
        console.log("Bank Accounts:", bankAccounts);

        const message = {
            content: `**Statistics for ${dateString}**\n**Cash On Hand:** ${cashOnHand}\n**Bank Accounts:** ${bankAccounts}`
        };

        if (discordEnabled && webhookUrl) {

            fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            }).then(response => {
                if (response.ok) {
                    console.log('Message sent successfully');
                } else {
                    console.error('Error sending message:', response.status, response.statusText);
                }
            }).catch(error => {
                console.error('Fetch error:', error);
            });
        } else {
            console.warn("Discord disabled or webhook.4 not configured. Stats not sent.");
        }
        
        // Function to simulate hyperlink click
        function simulateHyperlinkClick() {
            const link = document.createElement('a');
            link.href = window.location.href;
            link.click();
        }

        // Random reload or refresh every 10 - 50 minutes
        const randomReloadTime = Math.random() * (3000000 - 600000) + 600000; // 10 to 50 minutes in milliseconds
        setTimeout(() => {
            const randomChance = Math.random();
            if (randomChance < 0.7) {
                console.log("Simulating hyperlink click to reload the page (70% chance)");
                simulateHyperlinkClick();
            } else {
                console.log("Using location.reload() to refresh the page (30% chance)");
                location.reload();
            }
        }, randomReloadTime);
    });
});
