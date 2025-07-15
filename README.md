# 🚀 BootApp – Bootleggers.us Automation Extension

**BootApp** is a powerful Chrome/Firefox extension designed to automate and streamline various gameplay tasks on [Bootleggers.us](https://www.bootleggers.us). From auto-crimes and bullet buying to Discord alerts and energy management — BootApp boosts your efficiency while keeping you ahead of the game.

---

## 🧩 Features Overview

BootApp automatically enhances multiple areas of gameplay:

| Feature | Description |
|--------|-------------|
| **Auto-theft** | Auto attempts available thefts in an infinite loop. |
| **Bootlegging** | Auto sell booze-laden cars, resupply mode, alert Discord on booze spikes and noSpikes, visual spike highlighting, auto-negotiation, and helper buttons (car/train/drive ready). |
| **Escrow** | Quick-access buttons for streamlined escrow transactions. |
| **Cities** | Auto report overview to Discord upon page entry, auto-refresh every 20–50 mins. |
| **Statistics** | Auto report cash on hand and bank balances to Discord. |
| **Gold** | Manual gold price alert button. |
| **Crimes** | Auto crime stamping, energy refill logic for NY/AC using Speakeasy, infinite cycle. |
| **Bullet Factory** | Auto buy 100 bullets on loop, logs total in browser console (F12); auto melt low/medium cars. |
| **Organized Crimes (OC)** | Full OC automation: leader and participant logic. |
| **Jail System** | General auto self-bust and advanced Leavenworth modes with bust priorities (Scythe, Cigarettes, Adieu). |
| **HotdogCartGuy** | Auto buy hotdogs after first manual use. |
| **HotDogContest** | Automates contest actions. |
| **Shooting Range** | Auto weapon cycling, auto shoot, and popcorn consumption. |
| **Energy Module** | Handles energy refill using Beer, Banana, and Coffee. |
| **Gym Module** | Buys bananas and performs gym exercises automatically. |
| **Loading Fix** | Resolves stuck loading indicators via auto-refresh. |
| **Speakeasy Module** | Auto redirects back to Crimes after refilling in AC, NYC, and RM. |
| **Stamps** | Auto-open all stamps from Character page. |
| **Clean Inventory** | Configurable auto-cleaner: removes junk items, sorts inventory, opens loot boxes/stamps. |
| **MarkDown** | Sends current cars and booze inventory to Discord. |
| **Stamp Album** | Sell all duplicate stamps for collector points with a single click. |
| **Price Wheel 1** | Uses all nickels on the prize wheel automatically. |
| **Rackets** | Auto collect all rackets, performs random refresh checks. |
| **Poker Run** | Collect Poker Run bonuses automatically. |
| **Casino Race** | Automates 1:2 Yellow Track at 900 with 3x bets, tracks results, downloads CSV. |
| **Thanksgiving Event** | Auto hits turkey on the TG shooting range every 10 minutes. |
| **Gold Buying** | Auto buy from gold listings based on budget, thresholds, randomized refresh intervals. |
| **StickyTab Monitor** | Ensures 10 critical pages are open across tabs without duplication using `localStorage`. |
| **Discord Integration** | Sends alerts and status messages via Webhooks per feature. |
| **BossMode** | Hides game-specific UI elements for stealthy use. |
| **Captcha Solver** | Two modes: CapSolver API integration (requires API key) or manual Discord-based fallback. |
| **Hotkeys** | Keyboard shortcuts for rapid navigation throughout the game. |

---

## 🔧 Installation

### 🦊 Firefox

1. Clone this repo or download "Package v3.xx.zip"
2. Visit `about:debugging` → "This Firefox" → "Load Temporary Add-on".
3. Select the `manifest.json` from the cloned directory.

### 🧭 Chrome

1. Clone this repo or download "Package v3.xx.zip"
2. Visit `chrome://extensions/` and enable **Developer Mode**.
3. Click **"Load unpacked"** and select the cloned folder.

### 🧩 Chrome App Store

1. Search for BootApp.

---

## 📦 Project Structure

```bash
bootapp/
│
├── bootstrap/                  # UI styling (Bootstrap CSS/JS)
├── jquery/                    # jQuery
├── js/                        # All automation scripts (grouped by feature)
├── img/                       # Icons for extension
├── panel.html                 # UI popup panel with feature overview
├── manifest.json              # WebExtension manifest
└── README.md                  # You're here
