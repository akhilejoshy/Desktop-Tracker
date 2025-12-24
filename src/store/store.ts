import { configureStore } from "@reduxjs/toolkit";
import taskSlice from "./slices/taskSlice"
import loginSlice from './slices/loginSlice';
import activitySlice from './slices/activitySlice';


 const store = configureStore({
    reducer:{
    task:taskSlice,
    login:loginSlice,
    activity:activitySlice
}
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store