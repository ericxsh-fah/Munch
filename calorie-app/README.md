# CalorieApp — alternativă gratuită la Yazio

Aplicație mobilă completă și 100% gratuită, fără abonamente:
- Calculator de calorii (BMR/TDEE, formula Mifflin-St Jeor) și obiective de macronutrienți
- Jurnal alimentar zilnic (mic dejun / prânz / cină / gustări)
- Bază de date de alimente cu calorii/proteine/carbohidrați/grăsimi la 100g
- **Scanare cod de bare** (EAN/UPC) — folosește camera telefonului + baza gratuită [Open Food Facts](https://world.openfoodfacts.org)
- Rețete sănătoase cu ingrediente și valori nutriționale calculate automat
- Cont de utilizator (email + parolă), date salvate permanent pe un server al tău

Structură:
```
calorie-app/
  backend/    → server Node.js + bază de date (rulează pe calculatorul tău sau într-un cloud gratuit)
  mobile/     → aplicația React Native (Expo), rulează pe telefonul tău prin Expo Go
  render.yaml → configurare pentru deploy automat gratuit pe Render.com
```

---

## 🚀 Ghid complet: hosting gratuit + cod QR permanent

Asta e varianta prin care **oricine** poate scana un cod QR și primi aplicația, oriunde s-ar afla, fără să depindă de laptopul tău. Toți pașii sunt gratuiți. Urmează-i exact în această ordine.

### A. Pune backend-ul online (Render.com, gratuit)

1. Creează un cont gratuit pe [github.com](https://github.com) (dacă nu ai deja)
2. Urcă folderul `calorie-app` complet într-un repository nou pe GitHub (poți trage folderul direct pe pagina „Create repository" → „uploading an existing file", sau cu `git`)
3. Creează cont gratuit pe [render.com](https://render.com) și conectează-l la contul tău de GitHub
4. Pe render.com: **New** → **Blueprint** → alege repository-ul tău → Render detectează automat fișierul `render.yaml` din proiect și configurează totul singur (server Node.js, comenzi de build/start, variabile de mediu)
5. Apasă **Deploy** și așteaptă 2-3 minute
6. Când e gata, primești o adresă publică, de tipul:
   ```
   https://calorie-app-backend.onrender.com
   ```
   Notează-o — e adresa ta de backend, funcțională non-stop, gratuit.

   ⚠️ **Notă despre planul gratuit Render:** serverul „adoarme" după ~15 minute de inactivitate și durează câteva secunde să pornească din nou la prima cerere (normal, fără cost). De asemenea, baza de date SQLite se resetează la fiecare redeploy de cod nou (nu și la simple reporniri) — perfect pentru test/uz personal sau cu prietenii, dar dacă vrei păstrare permanentă a datelor pe termen lung, mai târziu putem trece la o bază de date externă (ex. Postgres gratuit pe Render).

### B. Conectează aplicația mobilă la backend-ul online

Deschide `mobile/api.js` și înlocuiește:
```js
const BASE_URL = 'http://192.168.1.100:3000/api';
```
cu:
```js
const BASE_URL = 'https://calorie-app-backend.onrender.com/api';
```
(cu adresa ta reală de la Render, cu tot cu `/api` la final)

### C. Publică aplicația cu cod QR permanent (EAS)

```bash
cd calorie-app/mobile
npm install
npm install -g eas-cli
```

1. Creează cont gratuit pe [expo.dev](https://expo.dev)
2. Autentifică-te:
   ```bash
   eas login
   ```
3. Adaugă suportul de actualizări live:
   ```bash
   npx expo install expo-updates
   eas init
   eas update:configure
   ```
   (`eas init` completează automat `app.json` cu un `projectId` — nu editezi nimic manual)
4. Publică:
   ```bash
   eas update --branch production --message "Prima versiune"
   ```
5. Comanda îți dă un link de forma `https://expo.dev/accounts/<cont>/projects/calorie-app/updates/<id>` — deschide-l în browser. Acolo, expo.dev afișează automat un **cod QR**.
6. Fă captură de ecran la codul QR și trimite-l/pune-l pe telefon.

### D. Ce face persoana care primește codul
1. Instalează gratuit aplicația **Expo Go** (dacă nu o are — i se cere automat)
2. Scanează codul QR
3. Aplicația ta se deschide instant, complet funcțională, pe iOS sau Android

### E. Când modifici ceva în cod
De fiecare dată când schimbi ceva (în `backend/` sau `mobile/`):
- Pentru backend: `git push` către GitHub → Render redeploy-ează automat
- Pentru mobil: rulezi din nou `eas update --branch production --message "ce ai schimbat"` — codul QR **rămâne același**, oamenii primesc automat ultima versiune data viitoare când deschid aplicația

---

## Pasul 1 — Pornește serverul (backend)

Ai nevoie de [Node.js](https://nodejs.org) instalat (versiunea 18+).

```bash
cd calorie-app/backend
npm install
cp .env.example .env
npm run seed      # populează baza de date cu ~30 alimente și 5 rețete
npm start
```

Dacă vezi `Server pornit pe http://localhost:3000`, funcționează. Baza de date e un fișier SQLite (`calorie-app.db`) — nu ai nevoie de niciun cont sau server plătit.

**Important:** Notează adresa IP locală a calculatorului tău (nu `localhost`):
- Windows: `ipconfig` → caută „IPv4 Address" (ex: `192.168.1.34`)
- Mac: `ipconfig getifaddr en0`

## Pasul 2 — Configurează aplicația mobilă

Deschide `mobile/api.js` și înlocuiește:
```js
const BASE_URL = 'http://192.168.1.100:3000/api';
```
cu IP-ul tău real, ex: `http://192.168.1.34:3000/api`.

Telefonul și calculatorul trebuie să fie **pe aceeași rețea WiFi**.

## Pasul 3 — Rulează aplicația pe telefon

Instalează [Expo Go](https://expo.dev/client) din App Store / Google Play pe telefon.

```bash
cd calorie-app/mobile
npm install
npx expo start
```

Se va afișa un cod QR în terminal. Scanează-l cu camera telefonului (iOS) sau cu aplicația Expo Go (Android) — aplicația se va deschide live pe telefon, fără compilare, fără cont de developer.

---

## Ce poți face acum

1. Creezi cont (email + parolă) — se calculează automat caloriile țintă zilnice
2. Adaugi alimente în jurnal pe mese (mic dejun, prânz, cină, gustări) — manual sau **scanând codul de bare** al produsului
3. Cauți/adaugi rețete sănătoase, cu calcul automat de calorii per porție
4. Urmărești progresul zilnic (calorii + macronutrienți) pe ecranul principal
5. Actualizezi greutatea din Profil

## Extinderi ușoare pe viitor (opțional)
- Grafic de evoluție a greutății (datele sunt deja salvate în `weight_log`)
- Găzduire gratuită a backend-ului pe Render.com / Railway (planuri free) ca să nu mai fie nevoie ca laptopul tău să ruleze serverul
- Recunoaștere foto a mâncării (necesită un API de vision AI, singura funcție care implică un cost per utilizare)

## De ce e gratuită
Nu există niciun API plătit implicat — baza de date de alimente e stocată local (SQLite), calculele se fac cu formule matematice standard (Mifflin-St Jeor), iar găzduirea poate rămâne pe propriul tău calculator sau pe un plan gratuit de cloud.
