import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    _id: null,
    username: null,
    email: null,
    isBlocked: false,
    isVerified: false,
    roles: [],
    accessToken: null,
    refreshToken: null,
  },
  reducers: {
    setUser: (state, action) => {
      return { ...state, ...action.payload };
    },
    clearUser: (state) => {
      return {
        _id: null,
        username: null,
        email: null,
        isBlocked: false,
        isVerified: false,
        roles: [],
        accessToken: null,
        refreshToken: null,
      };
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;