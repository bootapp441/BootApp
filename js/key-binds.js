// Default fallback bindings
const DEFAULT_KEY_BINDINGS = {
  // menu
  profile: '1',
  items: '2',
  cars: '3',
  skills: '4',
  perks: '5',
  bank: '6',
  wallet: '7',
  cards: '8',
  // navigation
  prevPage: 'q',
  nextPage: 'e',
  left: 'a',
  right: 'd',
  arrowLeft: 'arrowleft',
  arrowRight: 'arrowright',
  // actions
  garage: 'g',
  ship: 'h',
  plates: 'j',
  repair: 'k',
  sell: 'l',
  drop: ';',
  selectCar: 's',
  // special actions
  shot: 'z',
  srepair: 'x',
  sship: 'c',
  ssell: 'v',
  // driver and car
  drive: 'f',
  stats: 'r',
  trunk: 't',
  // close and do
  goBack: 'w',
  doIt: 'enter',
  doItSpace: ' ',
};

// Get key from localStorage or use fallback
function getBinding(action) {
  const stored = localStorage.getItem(`binding.${action}`);
  return stored ? stored.toLowerCase() : DEFAULT_KEY_BINDINGS[action];
}

function onCharPage() {
  const charInterface = document.querySelector('.character-interface-container');
  const onCharPage = charInterface?.classList.contains('show');

  if (onCharPage) {
    return true;
  } else {
    return false;
  }
}

function onCarPage() {
  const button = document.querySelector(`button[data-panel="cars"]`);
  if (button.classList.contains('is-open')) {
    return true;
  } else {
    return false;
  }
}

function openCharacterPanel(panel) {
  if (!onCharPage()) {
    const shortcut = document.querySelector('.sideBar .desktop-character .BL-character-icon');
    if (shortcut) {
      shortcut.click();
      console.log("Opened character interface.");
    }
  }

  const button = document.querySelector(`button[data-panel="${panel}"]`);
  if (!button) return;

  if (button.classList.contains('is-open')) {
    console.log(`Already in ${panel} panel, skipping.`);
    return;
  }

  button.click();
  console.log(`Switched to ${panel} panel.`);
}

function dataAction(action) {
  if (onCharPage() && onCarPage()) {
    document.querySelector(`.car-action-button[data-action="${action}"]`)?.click();
    return;
  }
}

function dataSpecialsAction(action) {
  if (onCharPage() && onCarPage()) {
    document.querySelector(`.select-${action}`)?.click();
    return;
  }
}

document.addEventListener('keydown', async function (e) {
  // Ignore hotkeys if user is typing
  const target = e.target;
  if (
    target.isContentEditable ||
    // ['input', 'textarea', 'select'].includes(target.tagName.toLowerCase()) ||
    ['input', 'textarea'].includes(target.tagName.toLowerCase()) ||
    target.getAttribute('role') === 'textbox'
  ) {
    return;
  }

  const KEY_BINDING_ENABLED = localStorage.getItem('function.keybinding') || 'true';
  if (KEY_BINDING_ENABLED !== 'true') return;

  const key = e.key.toLowerCase();

  switch (key) {
    // Open character panels
    case getBinding('profile'): openCharacterPanel('character'); break;
    case getBinding('items'): openCharacterPanel('items'); break;
    case getBinding('cars'): openCharacterPanel('cars'); break;
    case getBinding('skills'): openCharacterPanel('skills'); break;
    case getBinding('perks'): openCharacterPanel('perks'); break;
    case getBinding('wallet'): openCharacterPanel('wallet'); break;
    case getBinding('cards'): openCharacterPanel('cigarette-cards'); break;
    case getBinding('bank'): openCharacterPanel('bank'); break;

    // Car actions on car page only
    case getBinding('drive'): dataAction('drive'); break;
    case getBinding('garage'): dataAction('garage'); break;
    case getBinding('ship'): dataAction('ship'); break;
    case getBinding('plates'): dataAction('plates'); break;
    case getBinding('repair'): dataAction('repair'); break;
    case getBinding('sell'): dataAction('sell'); break;
    case getBinding('drop'): dataAction('drop'); break;

    // Special actions
    case getBinding('shot'): dataSpecialsAction('hot-cars'); break;
    case getBinding('srepair'): dataSpecialsAction('repair'); break;
    case getBinding('sship'): dataSpecialsAction('ship'); break;
    case getBinding('ssell'): dataSpecialsAction('sell'); break;

    // Navigation
    case getBinding('left'):
    case getBinding('arrowLeft'): {
      if (onCharPage() && onCarPage()) {
        document.querySelector('.BL-wide-arrow.arrow-left.prev-car')?.click();
      }
      break;
    }

    case getBinding('right'):
    case getBinding('arrowRight'): {
      if (onCharPage() && onCarPage()) {
        document.querySelector('.BL-wide-arrow.arrow-right.next-car')?.click();
      }
      break;
    }

    case getBinding('prevPage'): {
      if (onCharPage() && onCarPage()) {
        document.querySelector('.prev-button.page-button')?.click();
      }
      break;
    }

    case getBinding('nextPage'): {
      if (onCharPage() && onCarPage()) {
        document.querySelector('.next-button.page-button')?.click();
      }
      break;
    }

    // driver and car
    case getBinding('stats'): {
      if (onCharPage() && onCarPage()) {
        document.querySelector('.stats-button')?.click();
      }
      break;
    }

    case getBinding('trunk'): {
      if (onCharPage() && onCarPage()) {
        document.querySelector('.trunk-button')?.click();
      }
      break;
    }

    case getBinding('selectCar'): {
      if (onCharPage() && onCarPage()) {
        const firstCar = document.querySelector('.cars-listing .car');
        if (firstCar) {
          firstCar.querySelector('.main-side')?.click();
        }
      }
      break;
    }

    // Close and do
    case getBinding('goBack'): {
      const closeButton = document.querySelector('.dialog .icon-close');
      if (closeButton && closeButton.offsetParent !== null) {
        closeButton.click();
        break;
      }
      const backButton = document.querySelector('.panel-top .go-back');
      if (backButton && backButton.offsetParent !== null) {
        backButton.click();
        break;
      }
      const closeMain = document.querySelector('.icon-close.main');
      if (closeMain && closeMain.offsetParent !== null) {
        closeMain.click();
        break; s
      }
      break;
    }

    case getBinding('doIt'):
    case getBinding('doItSpace'): {
      const doIt = document.querySelector('.buttons .do-button');
      if (doIt && doIt.offsetParent !== null) {
        doIt.click();
      }
      const use = document.querySelector('.left .use-item');
      if (use && use.offsetParent !== null) {
        use.click();
      }
      break;
    }

    default:
      break;
  }
});
