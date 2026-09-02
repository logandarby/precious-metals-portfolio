# Precious Metals Portfolio

A local hobby app for tracking purchases of precious metals (Gold, Silver, etc) and seeing how a portfolio's value changes over time.

Register or sign in (session cookie + CSRF), create a CAD portfolio, and log purchases. Holdings, cost basis, unrealized gain/loss, metal allocation, and a historical value series are derived from those transactions plus stored metal prices. Transactions are the portfolio input.

**Stack:** React & TypeScript frontend, Spring Boot & Spring Security API, PostgreSQL. Market prices can come from a mock provider so nothing external is required. Tests cover the money math (JUnit / Testcontainers).

## Run it

Docker and Compose are used.

```bash
cp .env.example .env
docker compose up --build
```

- UI: http://localhost:5173
- API: http://localhost:8080
- Postgres: localhost:5432 (`precious_metals`)

Data lives in a Compose volume.

## What you can do

- Register & Log in
- Create a portfolio
- Add a purchase: metal, quantity (oz or grams), price, date
- See transaction history
- See portfolio metrics
- See historical portfolio value

The API covers auth, portfolios, transactions, current value, and history. The UI is login/register plus the three portfolio screens.
