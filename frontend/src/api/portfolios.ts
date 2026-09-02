import { apiJson } from "./client";

export type Metal = "GOLD" | "SILVER" | "PLATINUM" | "PALLADIUM";

export type WeightUnit = "TROY_OUNCE" | "GRAM";

export type PortfolioAllocation = Partial<Record<Metal, number>>;

export type PortfolioResponse = {
  id: string;
  name: string;
  currency: string;
  value: number;
  costBasis: number;
  gain: number;
  returnPercent: number;
  allocation: PortfolioAllocation;
};

export type HistoryPoint = {
  date: string;
  value: number;
};

export type TransactionResponse = {
  id: string;
  portfolioId: string;
  metal: Metal;
  quantity: number;
  unit: WeightUnit;
  purchasePrice: number;
  currency: string;
  transactionDate: string;
};

export type CreateTransactionRequest = {
  metal: Metal;
  quantity: number;
  unit: WeightUnit;
  purchasePrice: number;
  transactionDate: string;
};

export type PortfolioListResponse = {
  totalValue: number;
  currency: string;
  portfolios: PortfolioResponse[];
};

export function listPortfolios(): Promise<PortfolioListResponse> {
  return apiJson<PortfolioListResponse>("/api/portfolios");
}

export function createPortfolio(name: string): Promise<PortfolioResponse> {
  return apiJson<PortfolioResponse>("/api/portfolios", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function getPortfolio(id: string): Promise<PortfolioResponse> {
  return apiJson<PortfolioResponse>(`/api/portfolios/${id}`);
}

export function renamePortfolio(
  id: string,
  name: string,
): Promise<PortfolioResponse> {
  return apiJson<PortfolioResponse>(`/api/portfolios/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export function deletePortfolio(id: string): Promise<void> {
  return apiJson<void>(`/api/portfolios/${id}`, { method: "DELETE" });
}

export type HistoryRange = "1W" | "1M" | "3M" | "1Y" | "YTD" | "ALL";

export function getPortfolioHistory(
  id: string,
  range: HistoryRange = "ALL",
): Promise<HistoryPoint[]> {
  const params = new URLSearchParams({ range });
  return apiJson<HistoryPoint[]>(`/api/portfolios/${id}/history?${params}`);
}

export function listTransactions(
  portfolioId: string,
): Promise<TransactionResponse[]> {
  return apiJson<TransactionResponse[]>(
    `/api/portfolios/${portfolioId}/transactions`,
  );
}

export function createTransactions(
  portfolioId: string,
  transactions: CreateTransactionRequest[],
): Promise<TransactionResponse[]> {
  return apiJson<TransactionResponse[]>(
    `/api/portfolios/${portfolioId}/transactions`,
    {
      method: "POST",
      body: JSON.stringify({ transactions }),
    },
  );
}
