import express from "express";

const app = express();
const port = 8090;
const metals = ["GOLD", "SILVER", "PLATINUM", "PALLADIUM"];
const basePrices = {
  GOLD: 3500,
  SILVER: 45,
  PLATINUM: 1550,
  PALLADIUM: 1200,
};
const currentPrices = { ...basePrices };
const maximumStep = 0.005;
const maximumDeviation = 0.05;

function nextPrice(metal) {
  const basePrice = basePrices[metal];
  const change = (Math.random() * 2 - 1) * maximumStep;
  const lowerBound = basePrice * (1 - maximumDeviation);
  const upperBound = basePrice * (1 + maximumDeviation);
  const price = currentPrices[metal] * (1 + change);

  currentPrices[metal] = Math.min(Math.max(price, lowerBound), upperBound);
  return Number(currentPrices[metal].toFixed(4));
}

app.get("/prices", (request, response) => {
  const currency = request.query.currency || "CAD";
  const generatedAt = new Date();
  const prices = metals.map((metal, index) => ({
    metal,
    price: nextPrice(metal),
    timestamp: new Date(generatedAt.getTime() + index * 1000).toISOString(),
  }));

  console.log(
    `Received market price request for currency=${currency} at ${generatedAt.toISOString()}`,
  );
  response.json({ currency, generatedAt: generatedAt.toISOString(), prices });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Mock market API listening on port ${port}`);
});
