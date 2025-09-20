import { Store } from '@tauri-apps/plugin-store'
import { create } from 'zustand'

export interface SidebarState {
  fileSidebarVisible: boolean
  toggleFileSidebar: () => Promise<void>
}

export const useSidebarStore = create<SidebarState>((set) => ({
  fileSidebarVisible: true,
  toggleFileSidebar: async () => {
    set((state) => ({
      fileSidebarVisible: !state.fileSidebarVisible
    }))
    const store = await Store.load('store.json')
    store.set('fileSidebarVisible', !store.get('fileSidebarVisible'))
  },
}))
