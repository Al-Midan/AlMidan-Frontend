import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  _id: string | null;
  username: string | null;
  email: string | null;
  isBlocked: boolean;
  isVerified: boolean;
  roles:string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

const initialState: UserState = {
  _id: null,
  username: null,
  email: null,
  isBlocked: false,
  isVerified: false,
  roles: null,
  accessToken: null,
  refreshToken: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      return { ...state, ...action.payload };
    },
    clearUser: () => initialState,
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;