<template>
  <CommonBtn
    icon="i-heroicons-logout-16-solid"
    @click="logout"
  />
</template>

<script setup lang="ts">

const supabase = useSupabaseClient();
const { auth } = useStore();

const logout = async () => {
  try {
    await supabase.auth.signOut();
    auth.logout();
    navigateTo('login');
  } catch (error) {
    console.error(error);
  }
  await supabase.auth.signOut();
};
</script>
