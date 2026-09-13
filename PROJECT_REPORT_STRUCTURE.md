# Project Report Structure

Generated on: 2026-09-12

Scope: this report covers the project files in `vj-arc-official` and `vj-arc-backend`.

Excluded from this report:
- `node_modules`
- generated build folders such as `dist` or `build`
- package-lock internals
- language/runtime built-in modules

## 1. Repository Layout

```text
website/
|-- PRODUCT.md
|-- PROJECT_REPORT_STRUCTURE.md
|-- vj-arc-official/
|   |-- package.json
|   |-- package-lock.json
|   |-- vite.config.js
|   |-- eslint.config.js
|   |-- index.html
|   |-- README.md
|   |-- public/
|   |   `-- images/
|   |       `-- logo.png
|   `-- src/
|       |-- main.jsx
|       |-- App.jsx
|       |-- App.css
|       |-- index.css
|       |-- assets/
|       |   `-- images
|       `-- components/
|           |-- About.jsx
|           |-- ClickBurst.jsx
|           |-- CustomCursor.jsx
|           |-- Hero.jsx
|           |-- Navbar.jsx
|           |-- Network.jsx
|           `-- WhatWeDo.jsx
`-- vj-arc-backend/
    |-- package.json
    |-- package-lock.json
    |-- server.js
    `-- src/
        |-- config/
        |   `-- db.js
        |-- controllers/
        |   `-- eventController.js
        |-- models/
        |   `-- Event.js
        `-- routes/
            `-- eventRoutes.js
```

## 2. Application Structure

### Frontend: `vj-arc-official`

The frontend is a React application built with Vite.

Runtime flow:

```text
index.html
`-- src/main.jsx
    `-- src/App.jsx
        |-- src/App.css
        |-- components/CustomCursor.jsx
        |-- components/ClickBurst.jsx
        |-- components/Navbar.jsx
        |-- components/Hero.jsx
        |   `-- components/Network.jsx
        |-- components/About.jsx
        `-- components/WhatWeDo.jsx
```

Main visible sections:
- `Navbar.jsx`: desktop/mobile navigation, active-section tracking, logo link, LinkedIn link placeholder
- `Hero.jsx`: landing hero section with animated headline, calls to scroll to sections, and `Network` visual
- `About.jsx`: club story, stats, vision/mission, and core focus areas
- `WhatWeDo.jsx`: program cards and marquee for initiatives
- `Network.jsx`: animated hexagonal network visual
- `CustomCursor.jsx`: custom desktop cursor
- `ClickBurst.jsx`: click particle animation

### Backend: `vj-arc-backend`

The backend is a CommonJS Express API using MongoDB through Mongoose.

Runtime flow:

```text
server.js
|-- src/config/db.js
`-- src/routes/eventRoutes.js
    `-- src/controllers/eventController.js
        `-- src/models/Event.js
```

API base route:

```text
/api/events
```

Event routes:

```text
GET    /api/events
GET    /api/events/:id
POST   /api/events
PUT    /api/events/:id
DELETE /api/events/:id
```

## 3. Required Imports By File

Built-in modules are intentionally excluded from these tables.

### Frontend Imports

| File | External imports | Local imports |
| --- | --- | --- |
| `vj-arc-official/index.html` | none | `/src/main.jsx` |
| `vj-arc-official/vite.config.js` | `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite` | none |
| `vj-arc-official/eslint.config.js` | `@eslint/js`, `globals`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint/config` | none |
| `vj-arc-official/src/main.jsx` | `react`, `react-dom/client` | `./index.css`, `./App.jsx` |
| `vj-arc-official/src/index.css` | Google Fonts URLs, `tailwindcss` | none |
| `vj-arc-official/src/App.jsx` | none | `./App.css`, `./components/CustomCursor`, `./components/ClickBurst`, `./components/Navbar`, `./components/Hero`, `./components/About`, `./components/WhatWeDo` |
| `vj-arc-official/src/App.css` | none | none |
| `vj-arc-official/src/components/About.jsx` | `motion/react`, `react`, `lucide-react` | none |
| `vj-arc-official/src/components/ClickBurst.jsx` | `react`, `motion/react` | none |
| `vj-arc-official/src/components/CustomCursor.jsx` | `motion/react`, `react` | none |
| `vj-arc-official/src/components/Hero.jsx` | `motion/react`, `lucide-react` | `./Network` |
| `vj-arc-official/src/components/Navbar.jsx` | `react`, `motion/react`, `lucide-react` | none |
| `vj-arc-official/src/components/Network.jsx` | `react`, `motion/react` | none |
| `vj-arc-official/src/components/WhatWeDo.jsx` | `react` | none |

### Backend Imports

| File | External imports | Local imports |
| --- | --- | --- |
| `vj-arc-backend/server.js` | `express`, `cors`, `dotenv` | `./src/config/db`, `./src/routes/eventRoutes` |
| `vj-arc-backend/src/config/db.js` | `mongoose` | none |
| `vj-arc-backend/src/routes/eventRoutes.js` | `express` | `../controllers/eventController` |
| `vj-arc-backend/src/controllers/eventController.js` | none | `../models/Event` |
| `vj-arc-backend/src/models/Event.js` | `mongoose` | none |

## 4. External Package Summary

### Frontend Packages Used In Source Or Config

```text
@eslint/js
@tailwindcss/vite
@vitejs/plugin-react
eslint
eslint-plugin-react-hooks
eslint-plugin-react-refresh
globals
lucide-react
motion
react
react-dom
tailwindcss
vite
```

Notes:
- `motion/react` is provided by the `motion` package.
- `eslint/config` is provided by the `eslint` package.
- `react-dom/client` is provided by the `react-dom` package.
- `tailwindcss` is imported from `src/index.css`.

### Backend Packages Used In Source

```text
cors
dotenv
express
mongoose
```

## 5. Local File Responsibilities

### Frontend

| File | Responsibility |
| --- | --- |
| `vj-arc-official/index.html` | Defines the root DOM node and loads the Vite React entry file. |
| `vj-arc-official/src/main.jsx` | Mounts the React app into `#root`. |
| `vj-arc-official/src/App.jsx` | Composes the top-level page structure. |
| `vj-arc-official/src/index.css` | Imports fonts and Tailwind, defines global theme variables and base styles. |
| `vj-arc-official/src/App.css` | Contains older starter styles plus the current `WhatWeDo` section styles. |
| `vj-arc-official/src/components/Navbar.jsx` | Handles navigation UI, scroll state, active links, and mobile menu state. |
| `vj-arc-official/src/components/Hero.jsx` | Renders the hero section and uses `Network` as the right-side visual. |
| `vj-arc-official/src/components/Network.jsx` | Renders the animated hexagonal network graphic. |
| `vj-arc-official/src/components/About.jsx` | Renders club story, metrics, vision/mission, and focus areas. |
| `vj-arc-official/src/components/WhatWeDo.jsx` | Renders program cards and moving initiative text. |
| `vj-arc-official/src/components/CustomCursor.jsx` | Adds an animated custom cursor on desktop screens. |
| `vj-arc-official/src/components/ClickBurst.jsx` | Adds click-based particle effects. |
| `vj-arc-official/public/images/logo.png` | Logo image used by the navbar. |

### Backend

| File | Responsibility |
| --- | --- |
| `vj-arc-backend/server.js` | Creates the Express app, applies middleware, registers routes, connects DB, and starts the server. |
| `vj-arc-backend/src/config/db.js` | Connects to MongoDB using `MONGO_URI`. |
| `vj-arc-backend/src/models/Event.js` | Defines the Mongoose event schema and model. |
| `vj-arc-backend/src/controllers/eventController.js` | Implements event list, detail, create, update, and delete handlers. |
| `vj-arc-backend/src/routes/eventRoutes.js` | Maps HTTP event routes to controller handlers. |

## 6. Environment And Runtime Requirements

### Frontend

Required commands from `vj-arc-official/package.json`:

```text
npm run dev
npm run build
npm run lint
npm run preview
```

### Backend

Required commands from `vj-arc-backend/package.json`:

```text
npm start
npm run dev
```

Required environment variables:

```text
MONGO_URI
PORT
```

`PORT` is optional because the backend defaults to `5000` when it is not set.

## 7. Notes And Attention Points

- The frontend currently does not import or call the backend event API.
- `Navbar.jsx` and `Hero.jsx` scroll to a section id named `programs`, but `WhatWeDo.jsx` currently renders `id="what-we-do"`.
- `vj-arc-official/index.html` references `/favicon.svg`, but no `public/favicon.svg` file was found in the scanned project files.
- `vj-arc-official/src/assets/images` is currently a zero-byte file, not a folder.
- Some visible text in JSX appears to contain encoding artifacts when read from the terminal; check those strings before production release.
