document.addEventListener("DOMContentLoaded", function () {
  $(document).ready(function () {

    const isBossEnabled = (localStorage.getItem('style.boss') ?? 'false') === 'true';
    if (!isBossEnabled) {
      console.log('🚫 Boss mode disabled — exiting script.');
      return;
    }

    // ----------------------
    // -- General page adjustments 
    // ----------------------
    document.body.style.backgroundImage = 'none';

    // Background removal for New Orleans
    if (document.documentElement.classList.contains('new-orleans')) document.head.insertAdjacentHTML('beforeend','<style>html.in-city.new-orleans body::after{background:black!important}</style>');
    if (document.documentElement.classList.contains('rocky-mount')) document.head.insertAdjacentHTML('beforeend','<style>html.in-city.rocky-mount body::after{background:black!important}</style>');

    const tbody = document.querySelector('table.cat.main-table tbody');
    if (tbody && tbody.children.length >= 2) {
      tbody.children[0].remove();
      tbody.children[0].remove(); // This is now the original second row
    }

    const iconContainer = document.querySelector('.BL-character-icon');
    if (iconContainer) {
      const img = iconContainer.querySelector('img[src$=".png"]');
      if (img) img.remove();

      // Ensure the box remains visible with 50x50 size
      iconContainer.style.width = '40px';
      iconContainer.style.height = '40px';
    }

    document.querySelectorAll('.BL-currency.bullets.shadowed').forEach(el => {
      el.style.backgroundImage = 'none';
    });

    const secondTd = document.querySelector('table.cat.main-table td:nth-of-type(2)');
    if (secondTd && secondTd.getAttribute('background') === '//www.blimg.us/images/game/template/innerbg_85.png') {
      secondTd.removeAttribute('background');
      secondTd.style.backgroundColor = 'rgb(40, 40, 40)';
    }

    var username = $('.username').text().trim();

    if (username) {
      const $display = $('<div>')
        .text(`${username}`)
        .css({
          position: 'fixed',
          bottom: '10px',   // ⬅ bottom of the screen!
          left: '10px',
          backgroundColor: '#2e2e2e',
          color: 'black',
          padding: '5px 10px',
          borderRadius: '5px',
          zIndex: 9999,
          fontSize: '14px',
          fontFamily: 'Arial, sans-serif'
        });

      $('body').append($display);
    }

    // ----------------------
    // -- Price Wheel 
    // ----------------------
    if (window.location.pathname === '/events/prize-wheel.php') {
      // Batch style updates
      document.querySelectorAll('.BL-prize-wheel').forEach(el => {
        el.style.margin = '23em auto';
      });

      document.querySelectorAll('.BL-prize-wheel .BL-content.BL-content-inner.content').forEach(el => {
        el.style.padding = '37% .5em .5em';
      });

      // Elements to remove
      const toRemove = [
        '.BL-prize-wheel-sign',
        '.BL-prize-wheel .wrapper',
        '.coin-drop-machine .nickel-box',
        '.coin-drop-machine .coin-drop.front',
        '.coin-drop-machine .coin-drop.back',
        '.coin-drop-machine .speed-option'
      ];

      toRemove.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) el.remove();
      });
    }

    // ----------------------
    // -- Gym
    // ----------------------
    if (window.location.pathname === '/gym.php') {
      const gymFooter = document.querySelector('.BL-gym .gym-footer');
      if (gymFooter) {
        gymFooter.remove();
      }

      // Function to remove background-image from targeted elements
      function removeGymBackgrounds() {
        document.querySelectorAll('.BL-gym .exercise-image, .BL-gym .background').forEach(el => {
          el.style.backgroundImage = 'none';
        });
      }

      // Initial run in case elements are already present
      removeGymBackgrounds();

      // Set up MutationObserver to watch for added nodes
      const gymObserver = new MutationObserver(() => {
        removeGymBackgrounds();
      });

      // Observe changes within .BL-gym if it exists
      const gymContainer = document.querySelector('.BL-gym');
      if (gymContainer) {
        gymObserver.observe(gymContainer, { childList: true, subtree: true });
      }
    }

    // ----------------------
    // -- Factory
    // ----------------------
    if (window.location.pathname === '/bullet-factory.php') {
      const meltOwner = document.querySelector('.BL-bullet-factory .BL-content');
      if (meltOwner) {
        meltOwner.style.position = 'relative';
        meltOwner.style.top = '-30px';
        meltOwner.style.left = '185px';
        //meltOwner.style.zIndex = '9999'; // ensure it's on top
      }

      const meltDiv = document.querySelector('.BL-bullet-factory .BL-content.BL-content-inner.melt.BL-timer');
      if (meltDiv) {
        meltDiv.style.position = 'relative';
        meltDiv.style.top = '-376px';
        meltDiv.style.left = '-243px';
        //meltDiv.style.zIndex = '9999'; // ensure it's on top
      }

      document.querySelectorAll('.factory .factory-image').forEach(el => {
        el.style.backgroundImage = 'none';
        el.style.width = '166px';
      });

      // Function to remove car images
      function removeCarImages() {
        document.querySelectorAll('.car-listings .car-display .BL-car img').forEach(img => {
          img.remove();
        });
      }

      // Initial run
      removeCarImages();

      // Set up MutationObserver on the whole page
      const factoryObserver = new MutationObserver(() => {
        removeCarImages();
      });

      // Observe changes inside entire document
      factoryObserver.observe(document.body, { childList: true, subtree: true });
    }

    // ----------------------
    // -- Bootlegging
    // ----------------------
    if (window.location.pathname === '/bootlegging.php') {
      const bootlegBody = document.querySelector('.insideTables.bootlegging-page tbody');
      if (bootlegBody && bootlegBody.children.length >= 2) {
        bootlegBody.children[0].remove();
      }

      document.querySelectorAll('.bootlegging-page').forEach(el => {
        el.style.marginTop = '-7px';
      });

      document.querySelectorAll('.bootlegging-page .bootlegging-heading').forEach(el => {
        el.style.backgroundImage = 'none';
        el.style.height = '50px';
      });

      document.querySelectorAll('.bootlegging-page .booze-cell .booze-and-crate').forEach(el => {
        el.style.backgroundImage = 'none';
        el.style.width = '1px';
      });

      // Function to remove car images
      function removeCarImages() {
        document.querySelectorAll('.car-container .BL-car img').forEach(img => {
          img.remove();
        });
      }

      // Initial run
      removeCarImages();

      // Set up MutationObserver on the whole page
      const bootObserver = new MutationObserver(() => {
        removeCarImages();
      });

      // Observe changes inside entire document
      bootObserver.observe(document.body, { childList: true, subtree: true });
    }

    // ----------------------
    // -- Auto Theft
    // ----------------------
    if (window.location.pathname === '/auto-theft.php') {
      // Function to remove .stolen-car div
      function removeStolenCar() {
        document.querySelectorAll('.stolen-car').forEach(el => {
          el.remove();
        });
      }

      // Initial check in case it's already present
      removeStolenCar();

      // Set up MutationObserver
      const theftContainer = document.querySelector('.BL-auto-theft') || document.body;
      const observer = new MutationObserver(() => {
        removeStolenCar();
      });

      observer.observe(theftContainer, { childList: true, subtree: true });
    }

    // ----------------------
    // -- Crimes
    // ----------------------
    if (window.location.pathname === '/crimes.php') {
      const configTab = document.querySelector('.BL-crimes .tab[data-crimes="configuration"]');

      if (configTab) {
        // Deselect all tabs
        document.querySelectorAll('.BL-crimes .tab').forEach(tab => {
          tab.classList.remove('selected');
        });

        // Select the Configuration tab
        configTab.classList.add('selected');

        // Remove 'show' class from all crime blocks
        document.querySelectorAll('.crimes .crime').forEach(crime => {
          crime.classList.remove('show');
        });

        // Add 'show' only to crime-configuration blocks
        document.querySelectorAll('.crimes .crime-configuration').forEach(crime => {
          crime.classList.add('show');
        });
      }
    }
  });
});