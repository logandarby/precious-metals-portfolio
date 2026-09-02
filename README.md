# Precious Metals Portfolio

A local hobby app for tracking gold, silver, platinum, and palladium purchases and seeing how a portfolio’s value changes over time.

Register or sign in (session cookie + CSRF), create a CAD portfolio, and log purchases. Holdings, cost basis, unrealized gain/loss, metal allocation, and a historical value series are derived from those transactions plus stored metal prices. No sales and no product catalog — transactions are the only portfolio input.

**Stack:** React + TypeScript frontend, Spring Boot + Spring Security API, PostgreSQL. Valuation uses `BigDecimal`. Market prices can come from a mock provider so nothing external is required. Tests cover the money math (JUnit / Testcontainers).

## Run it

Docker and Compose are enough.

```bash
cp .env.example .env
docker compose up --build
```

- UI: http://localhost:5173
- API: http://localhost:8080
- Postgres: localhost:5432 (`precious_metals`)

Data lives in a Compose volume, so a restart does not wipe portfolios.

## What you can do

- Register an account or sign in (30-minute session cookie)
- Create a named portfolio in CAD
- Add a purchase: metal, quantity (oz or grams), price, date
- See transaction history
- See current value, cost, gain/loss, and allocation
- See a line chart of portfolio value over time

The API covers auth, portfolios, transactions, current value, and history. The UI is login/register plus the three portfolio screens.
