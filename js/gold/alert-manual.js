document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {

        const isGoldAlertEnabled = (localStorage.getItem('gold.alert') ?? 'true') === 'true';
        if (isGoldAlertEnabled) {
            console.log('🚫 Gold Alert enabled — exiting manual script.');
            return;
        }

        const discordEnabled = localStorage.getItem('discord.enabled') === 'true';
        const webhookURL = localStorage.getItem('discord.webhook.9');

        if (!discordEnabled || !webhookURL) {
            console.log('🚫 Discord webhook disabled or missing — skipping alert buttons.');
            return;
        }

        // Loop through each row in the table
        $('tr').each(function () {
            var currentRow = $(this);
            var previousRow = currentRow.prev('tr.sub3'); // Find the previous row with class 'sub3'

            // Check if the previous row has a td with the value 'Accept'
            if (previousRow.length > 0 && previousRow.find('td:contains("Accept")').length > 0) {

                // Search the current row for the cell that contains the word "each"
                var priceCell = currentRow.find('td:contains("each") span'); // Assuming the price is inside a <span>

                if (priceCell.length > 0) {
                    var priceText = priceCell.text().trim(); // Get the price text
                    var alertButton = '<span style="font-size: 8pt; margin-right: 5px; appearance: auto; user-select: none; align-items: flex-start; text-align: center; cursor: default; box-sizing: border-box; background-color: buttonface; color: buttontext; white-space: pre; padding-block: 1px; padding-inline: 6px; border-width: 2px; border-style: outset; border-color: buttonborder; border-image: initial;" class="send-alert">Send Alert</span>'; // Create alert button
                    priceCell.prepend(alertButton); // Prepend the button to the price cell (before the price)
                }
            }
        });

        // Event handler for sending alerts
        $('.send-alert').on('click', function () {
            console.log($(this).attr('class'));

            var priceText = $(this).parent().text().trim().replace('Send Alert', '').trim();
            var username = $('.username').text().trim();

            var data = {
                content: '',
                embeds: [
                    {
                        description: 'Lowest Gold value on Marketplace: **' + priceText + '** (' + username + ')',
                        color: 15844367 // Set the embed color
                    }
                ]
            };

            console.log(priceText);

            // Send the alert via AJAX to the Discord webhook
            $.ajax({
                url: webhookURL,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: function (response) {
                    // Only things in scope of this promise will be able to be logged -- Pricetext is out of scope.
                    console.log('Alert sent successfully for price: ');
                },
                error: function (xhr, status, error) {
                    console.error('Error sending alert: ' + error);
                }
            });
        });
    });
});
