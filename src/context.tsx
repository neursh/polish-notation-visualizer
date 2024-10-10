import { create } from 'zustand';

interface AppState {}

interface AppActions {}

const initialState: AppState = {};

const useAppContext = create<AppState & AppActions>()((set) => ({
  ...initialState,
}));

export default useAppContext;
