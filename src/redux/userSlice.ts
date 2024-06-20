import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  _id: null,
  username: null,
  email: null,
  isBlocked: false,
  isVerified: false,
  roles: [],
  accessToken: null,
  refreshToken: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      return { ...state, ...action.payload };
    },
    clearUser(state) {
      return initialState;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
