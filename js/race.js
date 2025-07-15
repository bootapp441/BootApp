document.addEventListener('DOMContentLoaded', function() {
    $(document).ready(function() {
        // Retrieve result data or initialize with default structure
        let result = JSON.parse(localStorage.getItem('result')) || {}; 
        
        // Ensure all required keys exist in result
        result.totalLoss = result.totalLoss || 0;
        result.totalWin = result.totalWin || 0;
        result.totalResult = result.totalResult || 0;

        // Save updated result back to localStorage (if fields were missing)
        localStorage.setItem('result', JSON.stringify(result));

        // Function to update result data
        function updateresult(loss, win) {
            result.totalLoss += loss;
            result.totalWin += win;
            result.totalResult = result.totalWin - result.totalLoss;

            localStorage.setItem('result', JSON.stringify(result));
            logResult();
            updateStatsDiv();
        }
        
        // Function to log result data
        function logResult() {
            console.log(`Total Loss: $${result.totalLoss}`);
            console.log(`Total Win: $${result.totalWin}`);
            console.log(`Result: $${result.totalResult}`);
        }
        logResult()

        // Function to clear result and streak data
        function clearResult() {
            result = { totalResult: 0, totalLoss: 0, totalWin: 0 };
            streakData = { streakType: null, streakCount: 0 };
            localStorage.setItem('result', JSON.stringify(result));
            localStorage.setItem('streakData', JSON.stringify(streakData));
            csvData = "outcome;timestamp;amount;streak\n"; // Reset CSV data
            localStorage.setItem('csvData', csvData);

            logResult();
            updateStatsDiv();
            console.log("Statistics, streak, and CSV data cleared.");
        }

        // Function to format numbers as monetary values
        function formatAsCurrency(value) {
            return value.toLocaleString('en-US');
        }

        // Function to update the statistics div dynamically
        function updateStatsDiv() {
            $("#stats-div").html(`
                Total Loss: $${formatAsCurrency(result.totalLoss)} <br>
                Total Win: $${formatAsCurrency(result.totalWin)} <br>
                Result: $${formatAsCurrency(result.totalResult)}
            `);
        }

        // Retrieve existing CSV data from localStorage or initialize with headers
        let csvData = localStorage.getItem('csvData') || "outcome;timestamp;amount;streak\n";

        // Initialize streak tracking
        let streakData = JSON.parse(localStorage.getItem('streakData')) || {
            streakType: null, // 'win' or 'loss'
            streakCount: 0
        };

        // Function to save CSV data to localStorage
        function saveCSVToLocalStorage() {
            localStorage.setItem('csvData', csvData);
        }
        
        // Function to get the current timestamp
        function getTimestamp() {
            return new Date().toLocaleString('en-US', { hour12: false });
        }

        // Function to log win or loss, add to streak data, and update CSV
        function logOutcome(outcome, amount) {
            const timestamp = getTimestamp();
            const formattedAmount = `$${amount.toLocaleString('en-US')}`;

            // Update streak
            if (streakData.streakType === outcome) {
                streakData.streakCount += 1;
            } else {
                streakData.streakType = outcome;
                streakData.streakCount = 1;
            }

            // Save streak data
            localStorage.setItem('streakData', JSON.stringify(streakData));

            const csvRow = `${outcome};${timestamp};${formattedAmount};${streakData.streakCount}\n`;
            csvData += csvRow;
            saveCSVToLocalStorage(); // Save updated CSV to localStorage
            console.log(`Logged: ${csvRow.trim()}`);
        }

        // Function to download CSV
        function downloadCSV() {
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', 'game_results.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log("CSV file downloaded.");
        }

        function checkWinningText() {
            const winningElement = $("body").find("*:contains('You won $')").filter(function () {
                return $(this).text().match(/You won \$[\d,]+/);
            });
            
            if (winningElement.length) {
                // Extract the "You won $xxx" amount
                const wonAmountText = winningElement.text();
                const wonAmountMatch = wonAmountText.match(/You won \$([\d,]+)/);
            
                if (wonAmountMatch) {
                    const wonAmount = parseInt(wonAmountMatch[1].replace(/,/g, '')) / 2; // Divide the wonAmount by 2
                    // const wonAmount = parseInt(wonAmountMatch[1].replace(/,/g, ''));
                    console.log(`Lost amount found: $${wonAmount}`);
                    updateresult(0, wonAmount); // Only update won
                    logOutcome("w", wonAmount)
                } else {
                    console.log("No won amount found in the text.");
                }
            } else {
                console.log("No 'You won' text found.");
            }
        }
        checkWinningText();

        function checkLosingText() {
            const losingElement = $("body").find("*:contains('You lost $')").filter(function () {
                return $(this).text().match(/You lost \$[\d,]+/);
            });
            
            if (losingElement.length) {
                // Extract the "You lost $xxx" amount
                const lostAmountText = losingElement.text();
                const lostAmountMatch = lostAmountText.match(/You lost \$([\d,]+)/);
            
                if (lostAmountMatch) {
                    const lostAmount = parseInt(lostAmountMatch[1].replace(/,/g, ''));
                    console.log(`Lost amount found: $${lostAmount}`);
                    updateresult(lostAmount, 0); // Only update lost
                    logOutcome("l", lostAmount)
                } else {
                    console.log("No lost amount found in the text.");
                }
            } else {
                console.log("No 'You lost' text found.");
            }
        }
        checkLosingText();

        // Function to fill the input field
        function fillInputField(value) {
            $('input[name="racebet"]').val(value);
            console.log(`Input field filled with ${value}.`);
        }

        // Function to submit the form
        function submitForm() {
            setTimeout(() => {      
                $('input[value="Place bet!"]').closest('form').submit();
                console.log("Form submitted.");
            }, getRandomInt(1000, 3000)); 
        }

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        // Function to check for specific text in the DOM
        function autoYellow() {
            // Define loss and winning texts
            const lostTexts = {
                "</b> won!<br>You lost <b>$100</b>": "100"
                // "</b> won!<br>You lost <b>$322</b>": "1037",
                // "</b> won!<br>You lost <b>$1,037</b>": "3339",
                // "</b> won!<br>You lost <b>$3,339</b>": "10750",
                // "</b> won!<br>You lost <b>$10,750</b>": "34616",
                // "</b> won!<br>You lost <b>$34,616</b>": "111464",
                // "</b> won!<br>You lost <b>$111,464</b>": "358915",
                // "</b> won!<br>You lost <b>$358,915</b>": "1155705",
                // "</b> won!<br>You lost <b>$1,155,705</b>": "3721370",
                // "</b> won!<br>You lost <b>$3,721,370</b>": "11982811",
                // "</b> won!<br>You lost <b>$11,982,811</b>": "38584652",
                // "</b> won!<br>You lost <b>$38,584,652</b>": "124242580",
                // "</b> won!<br>You lost <b>$124,242,580</b>": "322" // Reset or custom logic
            };

            // Check for "You won" text
            if ($("body").html().includes("You won")) {
                console.log("Winning text found. Restarting bet with $100.");
                fillInputField("100");
                submitForm();
            } else {
                // Check for loss texts
                const lostKey = Object.keys(lostTexts).find(text => $("body").html().includes(text));
                if (lostKey) {
                    const nextBet = lostTexts[lostKey];
                    console.log(`Loss detected. Next bet: $${nextBet}`);
                    fillInputField(nextBet);
                    submitForm();
                } else {
                    console.log("No relevant text found.");
                }
            }
        }
        // Check for the winning or losing text in the DOM
        autoYellow()
        
        // Create the span and place it under the "Place Bet!" text
        var yellowSpan = '<center><br><br><span style="font-size: 10pt; background-color: #a12c13; color: white; font-weight: bold; padding: 5px 10px; border: 1px solid white; border-radius: 10px; cursor: pointer;" class="start-auto-yellow">Auto Yellow</span></center>';
        
        // Add the "Clear Result Data" button
        var clearButton = '<center><br><br><span style="font-size: 10pt; background-color: #a12c13; color: white; font-weight: bold; padding: 5px 10px; border: 1px solid white; border-radius: 10px; cursor: pointer;" class="clear-result-data">Clear Data</span></center>';     

        // Add a button to download the CSV
        var downloadButton = '<center><br><br><span style="font-size: 10pt; background-color: #a12c13; color: white; font-weight: bold; padding: 5px 10px; border: 1px solid white; border-radius: 10px; cursor: pointer;" class="download-csv">Download CSV</span></center>';

        // Create the statistics div
        var statsDiv = '<center><br><br><div id="stats-div" style="width: 20%; font-size: 10pt; background-color: #a12c13; color: white; font-weight: bold; padding: 5px 10px; border: 1px solid white; border-radius: 10px; cursor: pointer;">'
        + 'Total Loss: $0 <br>'
        + 'Total Win: $0 <br>'
        + 'Result: $0'
        + '</div></center>';

        // Locate the parent div containing "Casino wealth"
        var casinoWealthDiv = $("div:contains('Casino wealth')");

        // Append the span
        casinoWealthDiv.after(yellowSpan + clearButton + downloadButton + statsDiv);
        
        // Add click event listener to the dynamically created span
        $(document).on('click', '.start-auto-yellow', function() {
            console.log("Start Auto Yellow clicked.");
            
            // Simulate a click on the 1:2 Yellow element
            $("td[onclick*=\"changeColor('Yellow','FFFF00', 1)\"]").trigger('click');
            console.log("1:2 Yellow clicked.");
            
            // Fill the input field with "100"
            fillInputField("100");
            
            // Submit the form
            submitForm();
        });

        // Attach event listener to download button
        $(document).on('click', '.download-csv', function () {
            downloadCSV();
        });
        
        // Add event listener for the clear button
        $(document).on('click', '.clear-result-data', function () {
            clearResult();
        });

        // Set a random interval between 20 and 25 seconds
        var randomInterval = Math.random() * (25 - 20) + 20; // Random time in seconds
        randomInterval *= 1000; // Convert to milliseconds
        
        // Automatically click the yellowSpan button after the random interval
        setTimeout(function() {
           $('.start-auto-yellow').trigger('click');
           console.log("Auto Yellow span clicked automatically after " + (randomInterval / 1000) + " seconds.");
        }, randomInterval);
        
        // Initial update for the stats div
        updateStatsDiv();
    });
});

