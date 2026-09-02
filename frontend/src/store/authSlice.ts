import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { login, me, register, type MeResponse } from '@/api/auth'
import { toRejectedApiError, type RejectedApiError } from '@/api/client'

export type AuthenticatedUser = MeResponse

export type AuthCredentials = {
  email: string
  password: string
}

export type AuthState = {
  user: AuthenticatedUser | null
  initialized: boolean
}

const initialState: AuthState = {
  user: null,
  initialized: false,
}

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', () => me())

export const loginUser = createAsyncThunk<
  AuthenticatedUser,
  AuthCredentials,
  { rejectValue: RejectedApiError }
>('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    return await login(email, password)
  } catch (error) {
    return rejectWithValue(toRejectedApiError(error))
  }
})

export const registerUser = createAsyncThunk<
  AuthenticatedUser,
  AuthCredentials,
  { rejectValue: RejectedApiError }
>('auth/register', async ({ email, password }, { rejectWithValue }) => {
  try {
    return await register(email, password)
  } catch (error) {
    return rejectWithValue(toRejectedApiError(error))
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.initialized = true
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null
        state.initialized = true
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.initialized = true
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.initialized = true
      })
  },
})

export default authSlice.reducer
