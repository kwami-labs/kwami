export default defineNuxtRouteMiddleware((to, _from) => {
  // const user = useSupabaseUser();
  // const { auth } = useStore();
  // if (!user.value && to.path !== '/login') {
  //   navigateTo('/login');
  // }
  // if (user.value && to.path === '/login') {
  //   auth.user = user.value;
  //   const session = useSupabaseSession();
  //   auth.session = session.value;
  //   if (session.value) {
  //     return navigateTo('/', { replace: true });
  //   }
  // }
});
