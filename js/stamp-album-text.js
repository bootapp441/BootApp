document.addEventListener('DOMContentLoaded', function() {
    $(document).ready(function() {
        document.querySelectorAll('.box .stamp-stats-table .text-collector-points').forEach(el => {
            const text = el.textContent.replace(/,/g, '').trim();
            const number = parseInt(text, 10);
            const coins = Math.floor(number / 125);
            const italicSpan = document.createElement('span');
            italicSpan.style.fontStyle = 'italic';
            italicSpan.textContent = ` (${coins}c)`;
            el.appendChild(italicSpan);
        });
    });
});
