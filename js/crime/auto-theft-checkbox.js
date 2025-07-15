document.addEventListener('DOMContentLoaded', function () {
    function addCrimeCheckboxes() {
        document.querySelectorAll('.crime').forEach(crimeElement => {
            let crimeId = crimeElement.dataset.id;
            if (!crimeId) return;

            let nameElement = crimeElement.querySelector('.name');
            if (!nameElement) return; // Skip if the name element is missing

            // Check if checkbox already exists
            if (nameElement.querySelector('.crime-checkbox')) return;

            // Create checkbox
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('crime-checkbox');
            checkbox.style.marginRight = '5px'; // Add spacing before text
            checkbox.checked = localStorage.getItem(`crimeEnabled_${crimeId}`) !== 'false'; // Default to true

            // Save state when checkbox is toggled
            checkbox.addEventListener('change', function () {
                localStorage.setItem(`crimeEnabled_${crimeId}`, checkbox.checked);
            });

            // Prepend checkbox before the name text
            nameElement.prepend(checkbox);
        });
    }

    // Run when the page loads
    addCrimeCheckboxes();
});
