import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toRejectedApiError, type RejectedApiError } from "@/api/client";
import {
  createPortfolio as createPortfolioRequest,
  deletePortfolio as deletePortfolioRequest,
  listPortfolios,
  renamePortfolio as renamePortfolioRequest,
  type PortfolioListResponse,
  type PortfolioResponse,
} from "@/api/portfolios";
import { logoutUser } from "@/store/authSlice";

export type PortfoliosState = {
  items: PortfolioResponse[];
  totalValue: number;
  loaded: boolean;
  loading: boolean;
  error: string | null;
};

const initialState: PortfoliosState = {
  items: [],
  totalValue: 0,
  loaded: false,
  loading: false,
  error: null,
};

type FetchPortfoliosArg = {
  force?: boolean;
} | void;

type RootWithPortfolios = {
  portfolios: PortfoliosState;
};

export const fetchPortfolios = createAsyncThunk<
  PortfolioListResponse,
  FetchPortfoliosArg,
  { rejectValue: RejectedApiError }
>(
  "portfolios/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await listPortfolios();
    } catch (error) {
      return rejectWithValue(toRejectedApiError(error));
    }
  },
  {
    condition: (arg, { getState }) => {
      if (arg?.force) {
        return true;
      }
      const { loaded, loading } = (getState() as RootWithPortfolios)
        .portfolios;
      return !loaded && !loading;
    },
  },
);

export const createPortfolio = createAsyncThunk<
  PortfolioResponse,
  string,
  { rejectValue: RejectedApiError }
>("portfolios/create", async (name, { rejectWithValue }) => {
  try {
    return await createPortfolioRequest(name);
  } catch (error) {
    return rejectWithValue(toRejectedApiError(error));
  }
});

export const renamePortfolio = createAsyncThunk<
  PortfolioResponse,
  { id: string; name: string },
  { rejectValue: RejectedApiError }
>("portfolios/rename", async ({ id, name }, { rejectWithValue }) => {
  try {
    return await renamePortfolioRequest(id, name);
  } catch (error) {
    return rejectWithValue(toRejectedApiError(error));
  }
});

export const deletePortfolio = createAsyncThunk<
  string,
  string,
  { rejectValue: RejectedApiError }
>("portfolios/delete", async (id, { rejectWithValue }) => {
  try {
    await deletePortfolioRequest(id);
    return id;
  } catch (error) {
    return rejectWithValue(toRejectedApiError(error));
  }
});

function upsertItem(
  items: PortfolioResponse[],
  portfolio: PortfolioResponse,
): PortfolioResponse[] {
  const index = items.findIndex((item) => item.id === portfolio.id);
  if (index === -1) {
    return [portfolio, ...items];
  }
  return items.map((item) => (item.id === portfolio.id ? portfolio : item));
}

function sumValues(items: PortfolioResponse[]): number {
  return items.reduce((total, item) => total + Number(item.value ?? 0), 0);
}

const portfoliosSlice = createSlice({
  name: "portfolios",
  initialState,
  reducers: {
    upsertPortfolio(state, action: PayloadAction<PortfolioResponse>) {
      state.items = upsertItem(state.items, action.payload);
      state.totalValue = sumValues(state.items);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolios.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolios.fulfilled, (state, action) => {
        state.items = action.payload.portfolios;
        state.totalValue = action.payload.totalValue;
        state.loaded = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchPortfolios.rejected, (state, action) => {
        state.loading = false;
        if (action.meta.aborted) {
          return;
        }
        state.error = action.payload?.message ?? "Could not load portfolios";
      })
      .addCase(createPortfolio.fulfilled, (state, action) => {
        state.items = upsertItem(state.items, action.payload);
        state.totalValue = sumValues(state.items);
        state.loaded = true;
      })
      .addCase(renamePortfolio.fulfilled, (state, action) => {
        state.items = upsertItem(state.items, action.payload);
        state.totalValue = sumValues(state.items);
      })
      .addCase(deletePortfolio.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.totalValue = sumValues(state.items);
      })
      .addCase(logoutUser.fulfilled, () => initialState);
  },
  selectors: {
    selectPortfolios: (state) => state.items,
    selectTotalValue: (state) => state.totalValue,
    selectPortfoliosLoading: (state) => state.loading,
    selectPortfoliosLoaded: (state) => state.loaded,
    selectPortfoliosError: (state) => state.error,
  },
});

export const { upsertPortfolio } = portfoliosSlice.actions;
export const {
  selectPortfolios,
  selectTotalValue,
  selectPortfoliosLoading,
  selectPortfoliosLoaded,
  selectPortfoliosError,
} = portfoliosSlice.selectors;
export default portfoliosSlice.reducer;
