document.addEventListener('DOMContentLoaded', function () {
  $(document).ready(function () {
    // 1. Read the current page's city (if .city-name is present)
    const cityName = $('.player-location .city-name').text().trim();

    // 2. Store it in localStorage if found
    if (cityName) {
      localStorage.setItem('lastKnownCity', cityName);
      console.log("[TAIL] Stored city:", cityName, "in localStorage");
    }

    // 3. Determine if we’re on a “tailing” page (where auto-refresh should happen)
    const tailingPages = [
      'bootlegging.php',
      'rackets.php',
      'auto-theft.php',
      'crimes.php',
      'bullet-factory.php',
      'travel.php',
      'orgcrime.php',
    ];
    const currentURL = window.location.href;
    let isTailingPage = tailingPages.some(page => currentURL.includes(page));

    // 4. If tailing page, set up an interval to check every 10 seconds if city is outdated
    if (isTailingPage) {
      setInterval(function () {
        const storedCity = localStorage.getItem('lastKnownCity') || '';
        if (storedCity && cityName && storedCity !== cityName) {
          if (currentURL.includes('orgcrime.php')) {
            // Always simulate hyperlink click on orgcrime.php
            console.log("[TAIL] (100%) orgcrime page — simulating hyperlink click");
            simulateHyperlinkClick();
          } else {
            const randomChance = Math.random();
            if (randomChance < 0.7) {
              console.log("[TAIL] (70%) Simulating hyperlink click to refresh");
              simulateHyperlinkClick();
            } else {
              console.log("[TAIL] (30%) Using location.reload()");
              location.reload();
            }
          }
        }
      }, 10000);
    }
    // Helper function to simulate a hyperlink click (alternative to location.reload)
    function simulateHyperlinkClick() {
      window.location.href = window.location.href;
    }
  });
});