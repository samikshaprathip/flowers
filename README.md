# Bouquet Builder

This workspace contains two projects:

- `bouquet-frontend`: React + Vite client
- `bouquet-backend`: Express + MongoDB API

## Local development

### Backend

1. Copy `bouquet-backend/.env.example` to `bouquet-backend/.env` and update the MongoDB URI.
2. Install dependencies and start the API:

```
cd bouquet-backend
npm install
npm run dev
```

### Frontend

1. Install dependencies and start the app:

```
cd bouquet-frontend
npm install
npm run dev
```

The frontend expects the API at `http://localhost:3001`. You can override it by setting `VITE_API_URL` in `bouquet-frontend/.env`.
