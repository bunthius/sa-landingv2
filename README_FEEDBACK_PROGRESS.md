# Website Homepage Revamp – Feedback Implementation Progress

> **Legend**  
> [ ] Not started [~] In progress [x] Complete  

---

## 1. Top Navigation
- [x] **CHANGE** `Game Info` ➜ **Game**
- [x] **ADD** dropdown under **Game** with:
  1. Star Atlas (`/`)
  2. SAGE Labs (`/sage-labs`)
  3. Holosim (`/holosim`)
- [x] **ADD** tab **Experience** → `https://legacy.staratlas.com/#experience`
- [x] **ADD** tab **News & Info** → `https://staratlas.com/newsroom`
- [x] **ADD** tab **Contact** → `https://staratlas.com/contact`
- [x] **CHANGE** `DOWNLOAD` ➜ **GALACTIC MARKETPLACE** → `https://play.staratlas.com/market/`
- [x] **REMOVE** tabs **Ships**, **Factions**, **Economy**, **Community**
- [x] **REMOVE** all check‑mark icons beside nav links
- [x] **REMOVE** top utility bar entries **News, Events, Support, English**

## 2. Hero Section
- [x] **VIDEO** background set to `herosection_loop_7‑21.mp4`
- [x] **TAGLINE** "Explore, Conquer, and Earn in a real cash economy."
- [x] **CTA LABEL** `PLAY NOW` ➜ **GET EARLY ACCESS**
- [x] **CTA FLOW**
  - When clicked, open modal:
    1. Email input  
    2. Disclaimer below input:  
       *"By entering your email, you'll get your early‑access key and occasional updates from Star Atlas. You can unsubscribe anytime."*
    3. Submit ⇒ `POST /api/early‑access`
  - Success message with key + copy‑to‑clipboard
  - Failure → inline error message

## 3. Sections to Remove
- [x] **REMOVE** *Latest Updates* section (until CMS hook exists)
- [x] **REMOVE** *Command Your Fleet* section

## 4. Game Section (formerly **Game Modes**)
- [x] **TITLE** `GAME`
- [x] **DESCRIPTION** "Immerse yourself in the vastness of Galia, where Star Atlas comes alive."
- [x] **CAROUSEL** 4‑thumb horizontal under active tab
- **3rd‑Person Experience Slides**
  1. **Galia** – "Explore the unexplored. … Build a galactic empire." → `/game`
  2. **Game Modes** – "Conquer Galia, then crush the competition. …" → `/game`
  3. **Your Fleet, Your Way** – "…view, build, and customise your fleet." → `/game`
  4. **Life in Galia** – "From the small, furred Punaabs to luminous beings of pure light …" → `/game`
- **Top‑down RTS Slides**
  1. **Fleet Command** – "…mass‑manage your fleets …" → `/game`
  2. **Holosim** – "Free‑to‑play in‑browser simulation …" → `/game`
  3. **SAGE Labs** – "Mine resources, craft items, scan for SDUs …" → `/game`
- [x] **TASK** Add left/right arrow controls, highlight active thumbnail, preload video for selected slide

## 5. Economy Section
- [x] Copy: "Join a real cash economy with real opportunities."
- [x] Metric label: **Average ATLAS Earned Daily**
- [x] Button: **Latest Economic Report** → `https://staratlas.com/newsroom/economic-reports`
- [x] **ADD** secondary button **Explore Galactic Marketplace** → `https://play.staratlas.com/market/`
- [~] Data placeholders updated when Econ team supplies new numbers (ETA 7/22)

## 6. Community Section
- [x] Copy updated
- [x] Only Discord link shown (remove X/Twitter & Reddit)
- [x] Image `Community_Website_july22.png` integrated

## 7. Footer
- [ ] Audit links once nav restructure is live
- [ ] Ensure policy pages still reachable

---

### Implementation Notes
- Video assets: `/src/assets/videos/`
- Thumbnails & images: `/src/assets/images/`
- Carousel built with SwiperJS (tree‑shaken build); breakpoints:  ≥1024 px shows 4 thumbs, 768‑1023 px shows 3, ≤767 px shows 2
- Modal uses HeadlessUI dialog for a11y

### Testing Checklist
1. Nav dropdown keyboard/ARIA compliance  
2. Email capture modal validation + API integration  
3. Carousel lazy‑load & swipe on mobile  
4. Verify removed sections no longer in DOM  
5. Lighthouse ≥90 on mobile/desktop  

---

_Last updated: **2025‑07‑22**_
