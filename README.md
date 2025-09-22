# 🌍 Travel-Maper App

You travel the world. **Travel-Maper** keeps track of your adventures. A world map that tracks your footsteps into every city you can think of. Never forget your wonderful experiences, and show your friends how you have wandered the world.

---

## 🚀 Features

- 🗺️ Leaflet Maps Implementation
- 🌎 Track all the cities you’ve visited
- 📍 Mark your footsteps on a world map
- ✅ Global State management using **React Context API**
- 🗺️ Navigation and routing with **React Router DOM**
- 🔗 Used **React Router DOM hooks** for navigation and URL management
- ⚡ Performance optimizations using **React.memo, useMemo, and useCallback**
- 🎨 Styling with **CSS Modules**
- 🛠️ Built with **TypeScript**

---

## 🧰 Tech Stack

- **React**
- **TypeScript**
- **React Router DOM v6** + hooks 
- **React Context API**
- **React Custom Hooks**
- **React.memo, useMemo, useCallback**
- **CSS Modules**

---

## 📂 Project Structure

```
TRAVEL-MAPER/
├─ data/                   # Likely JSON or static data files
├─ dist/                   # Build output folder
├─ node_modules/           # Dependencies
├─ public/                 # Public assets like index.html, images, JSON
└─ src/
   ├─ components/          # Reusable React components
   ├─ contexts/            # Context API files for global state
   ├─ hooks/               # Custom hooks
   ├─ pages/               # React Router pages
   ├─ App.tsx              # Root React component
   ├─ index.css             # Global CSS
   ├─ main.tsx             # Entry point for React + Vite
   ├─ vite-env.d.ts        # TypeScript types for Vite
.eslintrc.json             # ESLint config
index.html                 # Main HTML template
package.json / package-lock.json
tsconfig.json / tsconfig.node.json
vite.config.ts             # Vite config
```

---

## ⚡ Getting Started

### 1️⃣ Clone the repo

```bash
git clone https://github.com/<your-username>/world-wise.git
cd world-wise
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Run the development server

```bash
npm run dev
```

### 4️⃣ Build for production

```bash
npm run build
```

---

## 🌐 Deployment

This project can be easily deployed on **Netlify** or **Vercel**.\
If using Netlify, make sure your `cities.json` is inside the `public/` folder and fetch it like this:

```ts
fetch("/cities.json")
  .then((res) => res.json())
  .then((data) => setCities(data));
```

---

## 🎥 Demo

🔗 [Live Demo on Netlify](https://your-app-link.netlify.app)

---

## 📸 Screenshots

| Landing Pages | Web Application | 
| ------------- | --------------- |
|               |                 |

---

## 📚 Learnings

- Built a **world map tracker** by Using Leaflet to visualize visited cities
- Applied **React Context API** for Global state management
- Practiced **React Router DOM hooks** for navigation
- Optimized rendering using **React.memo, useMemo, and useCallback**
- Styled app using **CSS Modules**
- Enhanced TypeScript skills in a real-world React project

---


