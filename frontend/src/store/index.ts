import { configureStore } from "@reduxjs/toolkit";
import { createLogger } from "redux-logger";
import authReducer, { fetchCurrentUser } from "@/store/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) => {
    if (import.meta.env.DEV) {
      return getDefaultMiddleware().concat(
        createLogger({
          collapsed: true,
        }),
      );
    }

    return getDefaultMiddleware();
  },
});

store.dispatch(fetchCurrentUser());

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
