document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        // Select all <tr> elements inside .crimes-table tbody
        const trs = document.querySelectorAll('.crimes-table tbody tr');

        // === 1. Modify first and third <tr>'s first <td> to colspan="3" ===
        if (trs[0]) {
            const firstTd = trs[0].querySelector('td');
            if (firstTd) firstTd.setAttribute('colspan', '3');
        }

        if (trs[2]) {
            const thirdTd = trs[2].querySelector('td');
            if (thirdTd) thirdTd.setAttribute('colspan', '3');
        }

        // === 2. Add new <td> to the second <tr> ===
        if (trs[1]) {
            const newTd = document.createElement('td');
            newTd.className = 'tab';
            newTd.setAttribute('data-crimes', 'configuration');
            newTd.textContent = 'Configuration';
            trs[1].appendChild(newTd);
        }

        // === 3. Max width .crimes-table
        const STYLE_CRIMESTABLE_MAXWIDTH = localStorage.getItem('style.crimesTable.maxWidth') || '640px';
        const STYLE_CRIMESTABLE_MARGIN = localStorage.getItem('style.crimesTable.margin') || '-1em auto';
        const crimesTables = document.querySelectorAll('.crimes-table.BL-crimes');

        crimesTables.forEach(table => {
            table.style.maxWidth = STYLE_CRIMESTABLE_MAXWIDTH;
            table.style.margin = STYLE_CRIMESTABLE_MARGIN;
        });
    });
});
