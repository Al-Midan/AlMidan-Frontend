import { Middleware } from 'redux';
import { clearUser } from './userSlice';
import { redirect } from 'next/navigation';

const authMiddleware: Middleware = (store) => (next) => (action) => {
  const state = store.getState();
  const accessToken = state.user.accessToken;

  if (accessToken) {
    const decodedToken = JSON.parse(atob(accessToken.split('.')[1]));
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
      store.dispatch(clearUser());
      
      // Send a message to the user
      alert('Your session has expired. Please log in again.');
      
      // Redirect to the login page
      redirect('/login');
      
      return;
    }
  }

  return next(action);
};

export default authMiddleware;