import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toRejectedApiError, type RejectedApiError } from "@/api/client";
import {
  createTransactions as createTransactionsRequest,
  getPortfolio,
  getPortfolioHistory,
  listTransactions,
  type CreateTransactionRequest,
  type HistoryPoint,
  type HistoryRange,
  type PortfolioResponse,
  type TransactionResponse,
} from "@/api/portfolios";
import { logoutUser } from "@/store/authSlice";
import {
  createPortfolio,
  deletePortfolio,
  fetchPortfolios,
  renamePortfolio,
  upsertPortfolio,
} from "@/store/portfoliosSlice";

export type SelectedPortfolioState = {
  id: string | null;
  portfolio: PortfolioResponse | null;
  transactions: TransactionResponse[];
  history: HistoryPoint[];
  historyRange: HistoryRange;
  loadedId: string | null;
  loading: boolean;
  error: string | null;
  historyLoading: boolean;
  historyLoadedKey: string | null;
  historyRequestKey: string | null;
};

const initialState: SelectedPortfolioState = {
  id: null,
  portfolio: null,
  transactions: [],
  history: [],
  historyRange: "ALL",
  loadedId: null,
  loading: false,
  error: null,
  historyLoading: false,
  historyLoadedKey: null,
  historyRequestKey: null,
};

type RootWithSelected = {
  selectedPortfolio: SelectedPortfolioState;
};

export const fetchSelectedPortfolio = createAsyncThunk<
  { portfolio: PortfolioResponse; transactions: TransactionResponse[] },
  { id: string; force?: boolean },
  { rejectValue: RejectedApiError }
>(
  "selectedPortfolio/fetch",
  async ({ id }, { dispatch, rejectWithValue }) => {
    try {
      const [portfolio, transactions] = await Promise.all([
        getPortfolio(id),
        listTransactions(id),
      ]);
      dispatch(upsertPortfolio(portfolio));
      return { portfolio, transactions };
    } catch (error) {
      return rejectWithValue(toRejectedApiError(error));
    }
  },
  {
    condition: ({ id, force }, { getState }) => {
      if (force) {
        return true;
      }
      const selected = (getState() as RootWithSelected).selectedPortfolio;
      if (selected.loading && selected.id === id) {
        return false;
      }
      return selected.loadedId !== id;
    },
  },
);

export const fetchSelectedHistory = createAsyncThunk<
  HistoryPoint[],
  { id: string; range: HistoryRange; force?: boolean },
  { rejectValue: RejectedApiError }
>(
  "selectedPortfolio/fetchHistory",
  async ({ id, range }, { rejectWithValue }) => {
    try {
      return await getPortfolioHistory(id, range);
    } catch (error) {
      return rejectWithValue(toRejectedApiError(error));
    }
  },
  {
    condition: ({ id, range, force }, { getState }) => {
      if (force) {
        return true;
      }
      const selected = (getState() as RootWithSelected).selectedPortfolio;
      const key = historyKey(id, range);
      if (
        selected.historyRequestKey === key ||
        selected.historyLoadedKey === key
      ) {
        return false;
      }
      return true;
    },
  },
);

export const addPortfolioTransactions = createAsyncThunk<
  TransactionResponse[],
  { portfolioId: string; transactions: CreateTransactionRequest[] },
  { rejectValue: RejectedApiError }
>(
  "selectedPortfolio/addTransactions",
  async ({ portfolioId, transactions }, { dispatch, rejectWithValue }) => {
    try {
      const created = await createTransactionsRequest(portfolioId, transactions);
      await Promise.all([
        dispatch(
          fetchSelectedPortfolio({ id: portfolioId, force: true }),
        ).unwrap(),
        dispatch(fetchPortfolios({ force: true })),
      ]);
      return created;
    } catch (error) {
      return rejectWithValue(toRejectedApiError(error));
    }
  },
);

function historyKey(id: string, range: HistoryRange): string {
  return `${id}:${range}`;
}

const selectedPortfolioSlice = createSlice({
  name: "selectedPortfolio",
  initialState,
  reducers: {
    setHistoryRange(state, action: PayloadAction<HistoryRange>) {
      state.historyRange = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSelectedPortfolio.pending, (state, action) => {
        const nextId = action.meta.arg.id;
        state.id = nextId;
        state.loading = true;
        state.error = null;
        if (state.portfolio?.id !== nextId) {
          state.portfolio = null;
          state.transactions = [];
          state.loadedId = null;
          state.history = [];
          state.historyLoadedKey = null;
          state.historyRequestKey = null;
        }
      })
      .addCase(fetchSelectedPortfolio.fulfilled, (state, action) => {
        state.portfolio = action.payload.portfolio;
        state.transactions = action.payload.transactions;
        state.id = action.payload.portfolio.id;
        state.loadedId = action.payload.portfolio.id;
        state.loading = false;
        state.error = null;
        if (action.meta.arg.force) {
          state.historyLoadedKey = null;
        }
      })
      .addCase(fetchSelectedPortfolio.rejected, (state, action) => {
        state.loading = false;
        if (action.meta.aborted) {
          return;
        }
        state.error = action.payload?.message ?? "Could not load portfolio";
        if (state.loadedId !== action.meta.arg.id) {
          state.portfolio = null;
          state.transactions = [];
        }
      })
      .addCase(fetchSelectedHistory.pending, (state, action) => {
        state.historyLoading = true;
        state.historyRange = action.meta.arg.range;
        state.historyRequestKey = historyKey(
          action.meta.arg.id,
          action.meta.arg.range,
        );
      })
      .addCase(fetchSelectedHistory.fulfilled, (state, action) => {
        const key = historyKey(action.meta.arg.id, action.meta.arg.range);
        state.history = action.payload;
        state.historyLoading = false;
        state.historyLoadedKey = key;
        if (state.historyRequestKey === key) {
          state.historyRequestKey = null;
        }
      })
      .addCase(fetchSelectedHistory.rejected, (state, action) => {
        const key = historyKey(action.meta.arg.id, action.meta.arg.range);
        if (state.historyRequestKey === key) {
          state.historyRequestKey = null;
        }
        state.historyLoading = false;
        if (action.meta.aborted) {
          return;
        }
        state.history = [];
        state.historyLoadedKey = null;
      })
      .addCase(createPortfolio.fulfilled, (state, action) => {
        state.id = action.payload.id;
        state.portfolio = action.payload;
        state.transactions = [];
        state.history = [];
        state.loadedId = action.payload.id;
        state.loading = false;
        state.error = null;
        state.historyLoadedKey = null;
      })
      .addCase(renamePortfolio.fulfilled, (state, action) => {
        if (state.portfolio?.id === action.payload.id) {
          state.portfolio = action.payload;
        }
      })
      .addCase(deletePortfolio.fulfilled, (state, action) => {
        if (state.id === action.payload) {
          return initialState;
        }
      })
      .addCase(logoutUser.fulfilled, () => initialState);
  },
  selectors: {
    selectCurrentPortfolio: (state) => state.portfolio,
    selectCurrentPortfolioId: (state) => state.id,
    selectTransactions: (state) => state.transactions,
    selectHistory: (state) => state.history,
    selectHistoryRange: (state) => state.historyRange,
    selectSelectedLoading: (state) => state.loading,
    selectSelectedError: (state) => state.error,
    selectHistoryLoading: (state) => state.historyLoading,
    selectSelectedLoadedId: (state) => state.loadedId,
  },
});

export const { setHistoryRange } = selectedPortfolioSlice.actions;
export const {
  selectCurrentPortfolio,
  selectCurrentPortfolioId,
  selectTransactions,
  selectHistory,
  selectHistoryRange,
  selectSelectedLoading,
  selectSelectedError,
  selectHistoryLoading,
  selectSelectedLoadedId,
} = selectedPortfolioSlice.selectors;
export default selectedPortfolioSlice.reducer;
