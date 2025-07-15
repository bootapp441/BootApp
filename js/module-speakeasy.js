document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        // Function to get a random delay in milliseconds between a min and max value
        function getRandomDelay(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min) * 1000;
        }

        // Function to handle the error when the drink button is not found
        function handleDrinkButtonError(cityName) {
            console.error(`Drink button not found for city: ${cityName}`);
            // Redirect to crimes page after a random delay between 1-3 seconds
            setTimeout(() => {
                window.location.href = localStorage.getItem('enableExercise') === 'true'
                    ? 'https://www.bootleggers.us/gym.php'
                    : 'https://www.bootleggers.us/crimes.php';

            }, getRandomDelay(1, 3));

        }

        // Function to simulate the drink button click
        function drinkAndNavigate() {
            const cityName = $('.city-name').text().trim(); // Get the city name
            let drinkButton;

            if (cityName === 'New York City') {
                drinkButton = document.querySelector('.drink-button.order-drink');
            } else if (cityName === 'Rocky Mount') {
                drinkButton = document.querySelector('.drink-button.order-drink');
            } else if (cityName === 'Atlantic City') {
                const containers = document.querySelectorAll('.submit-container');
                for (let container of containers) {
                    if (container.querySelector('span')?.textContent.trim() === 'Order Drink') {
                        drinkButton = container.querySelector('.submit-button');
                        break;
                    }
                }
            }

            if (drinkButton) {
                console.log(`Drink button found for city: ${cityName}`);
                // Simulate drinking after a random delay between 1-3 seconds
                setTimeout(() => {
                    drinkButton.click();
                    setTimeout(() => {
                        window.location.href = localStorage.getItem('enableExercise') === 'true'
                            ? 'https://www.bootleggers.us/gym.php'
                            : 'https://www.bootleggers.us/crimes.php';

                    }, getRandomDelay(1, 3));
                }, getRandomDelay(1, 3));
            } else {
                handleDrinkButtonError(cityName);
            }
        }

        // Delay execution to ensure elements are available in the DOM
        setTimeout(drinkAndNavigate, getRandomDelay(1, 3));
    });
});
