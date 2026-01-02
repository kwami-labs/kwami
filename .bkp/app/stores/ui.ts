const useUIStore = defineStore('ui', {
  persist: true,
  state: () => ({
    // Theme / appearance
    isDark: false,
    key: 0,
    // Legacy fields kept for compatibility with existing components
    primary: 'orange',
    gray: 'stone',
    // New color model used by theme buttons
    color: {
      light: {
        primary: 'slate-500',
        secondary: 'purple-500',
        background: 'white',
        neutral: 'neutral-500',
      },
      dark: {
        primary: 'slate-500',
        secondary: 'purple-500',
        background: 'stone-900',
        neutral: 'neutral-500',
      },
    },
    flashlight: true,
    trunOnRGB: true,

    // General UI
    size: 'md',
    logoURL: 'https://www.innocv.com/',
    langs: [
      { value: 'ca', label: 'Català' },
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Español' },
      { value: 'eu', label: 'Euskara' },
      { value: 'gl', label: 'Galego' }
    ],
    locale: 'es',
    notification: {
      position: 'bottom-0'
    },

    // Video / effects
    iLocale: 0,
    iVideo: 0,
    showVideo: false,
    opacityVideo: 50,
    keyVideo: 0,

    // Window positions, etc
    windows: {} as any
  }),
  actions: {
    rerender () {
      this.key++;
    },
    setDark (value: boolean) {
      this.isDark = !!value;
    }
  }
});

export default useUIStore;
