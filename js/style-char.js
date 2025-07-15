document.addEventListener("DOMContentLoaded", function () {
  $(document).ready(function () {
    // ----------------------
    // -- Caracters Menu 
    // ----------------------
    const STYLE_MENU_MAXWIDTH = localStorage.getItem('style.characterMenu.maxWidth') || '280px';
    const STYLE_MENU_BORDER = localStorage.getItem('style.characterMenu.border') || '1px solid #595652';
    const STYLE_CONT_HEIGHT = localStorage.getItem('style.characterContainer.height') || '335px';
    const STYLE_CARL_MAXHEIGHT = localStorage.getItem('style.carListingPanel.maxHeight') || '44em';

    const characterMenu = document.querySelector(".character-interface.BL-content-2");
    if (characterMenu) {
      characterMenu.style.maxWidth = STYLE_MENU_MAXWIDTH
      characterMenu.style.border = STYLE_MENU_BORDER;
    }

    // Adjust height of .character-container
    const characterContainer = document.querySelector(".character-interface .character-container");
    if (characterContainer) {
      characterContainer.style.height = STYLE_CONT_HEIGHT;
    }

    // Adjust max-height of .panel-car-listing
    const carListingPanel = document.querySelector(".cars-display .panel-car-listing");
    if (carListingPanel) {
      carListingPanel.style.maxHeight = STYLE_CARL_MAXHEIGHT;
    }
  });
});