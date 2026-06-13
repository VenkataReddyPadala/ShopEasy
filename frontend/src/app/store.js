import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { productsApi } from "../services/productsApi.js";
import { setupListeners } from "@reduxjs/toolkit/query";
import { reviewsApi } from "../services/reviewsApi.js";
import { userApi } from "../services/userApi.js";
import { cartApi } from "../services/cartApi.js";
import checkoutReducer from "../features/checkout/checkoutSlice.js";
import { paymentApi } from "../services/paymentApi.js";
import { ordersApi } from "../services/ordersApi.js";
import { geoApi } from "../services/geoApi.js";

// const store = configureStore({
//   reducer: {
//     [productsApi.reducerPath]: productsApi.reducer,
//     [reviewsApi.reducerPath]: reviewsApi.reducer,
//     [userApi.reducerPath]: userApi.reducer,
//     [cartApi.reducerPath]: cartApi.reducer,
//     [paymentApi.reducerPath]: paymentApi.reducer,
//     [ordersApi.reducerPath]: ordersApi.reducer,
//     checkout: checkoutReducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware().concat(
//       productsApi.middleware,
//       reviewsApi.middleware,
//       userApi.middleware,
//       cartApi.middleware,
//       paymentApi.middleware,
//       ordersApi.middleware
//     ),
// });

// 1. Combine all your reducers into a single root reducer
const appReducer = combineReducers({
  [productsApi.reducerPath]: productsApi.reducer,
  [reviewsApi.reducerPath]: reviewsApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [cartApi.reducerPath]: cartApi.reducer,
  [paymentApi.reducerPath]: paymentApi.reducer,
  [ordersApi.reducerPath]: ordersApi.reducer,
  [geoApi.reducerPath]: geoApi.reducer,
  checkout: checkoutReducer,
});
// 2. Create a root reducer that intercepts a global clear signal
const rootReducer = (state, action) => {
  if (action.type === "GLOBAL_LOGOUT") {
    // Setting state to undefined forces all reducers to revert to their initial states
    state = undefined;
  }
  return appReducer(state, action);
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Raise threshold to 100ms so infinite scroll (orders) data doesn't trigger warning in console
        warnAfter: 100,
      },
    }).concat(
      productsApi.middleware,
      reviewsApi.middleware,
      userApi.middleware,
      cartApi.middleware,
      paymentApi.middleware,
      ordersApi.middleware,
      geoApi.middleware
    ),
});
setupListeners(store.dispatch);
export default store;
