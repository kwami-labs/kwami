const useAuthStore = defineStore('auth', {
  persist: true,
  state: () => ({
    session: {},
    user: {
      id: ''
    }
  }),
  actions: {
    logout () {
      this.session = {};
      this.user = { id: '' };
    },
    setUser (user: any) {
      this.user = user;
    }
  }
});

export default useAuthStore;
