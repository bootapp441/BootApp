document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        function initializeCrimeToggles() {
            document.querySelectorAll('.crimes .details').forEach(detail => {
                const crimeElement = detail.closest('.crime');
                if (!crimeElement) return; // Ensure we're inside a valid crime block

                const crimeId = crimeElement.getAttribute('data-id');
                if (!crimeId) return; // Skip if no crime ID is found

                // Check if the toggle already exists (avoid duplicates)
                if (detail.querySelector('.crime-toggle')) return;

                // Create checkbox
                const crimeToggle = document.createElement('input');
                crimeToggle.type = 'checkbox';
                crimeToggle.className = 'crime-toggle';
                crimeToggle.setAttribute('data-id', crimeId);
                crimeToggle.title = "Enable/Disable Crime";

                // Load state from localStorage
                crimeToggle.checked = localStorage.getItem(`crime_enabled_${crimeId}`) === 'true';

                // Event listener to store state on change
                crimeToggle.addEventListener('change', function () {
                    localStorage.setItem(`crime_enabled_${crimeId}`, this.checked);
                    console.log(`Crime ID ${crimeId} enabled: ${this.checked}`);
                });

                // Append checkbox to the left of the favorite star icon
                const nameContainer = detail.querySelector('.name');
                const favoriteIcon = nameContainer?.querySelector('.small-star-icon');

                if (nameContainer && favoriteIcon) {
                    nameContainer.insertBefore(crimeToggle, favoriteIcon);
                }
            });
        }

        // Run the function to add checkboxes
        initializeCrimeToggles();
    });
});