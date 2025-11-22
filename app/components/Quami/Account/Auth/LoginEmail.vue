<template>
  <div class="p-8">
    <UForm
      :schema="schema"
      :state="cred"
      class="space-y-4"
    >
      <UFormField
        :label="$t('email')"
      >
        <UInput
          v-model="cred.email"
          variant="none"
          required
          type="email"
          autocomplete="username"
          class="border border-primary rounded-md shadow-black
              dark:shadow-white !text-white"
          icon="i-heroicons-user"
        />
      </UFormField>
      <transition name="fade">
        <div
          v-if="isPassInputDisabled"
          class="w-full justify-center pt-2.5 transition-all duration-300
                ease-in-out rounded-full hover:shadow-lg"
        >
          <UFormField :label="$t('password')">
            <UInput
              v-model="cred.password"
              variant="none"
              required
              type="password"
              autocomplete="password"
              class="border border-primary rounded-md shadow-black
                  dark:shadow-white "
              icon="i-heroicons-key"
            />
          </UFormField>
        </div>
      </transition>
      <transition name="fade">
        <div
          v-if="isBtnDisabled"
          class="w-full justify-center pt-2.5 transition-all duration-300
                ease-in-out rounded-full hover:shadow-lg"
        >
          <div class="flex justify-center">
            <CommonBtnGradient
              type="submit"
              class="group px-12 pr-14 py-2 shadow-black
                  dark:shadow-white mt-8"
              icon="i-heroicons-rocket-launch-16-solid"
              @click="signInUp()"
            >
              {{ $t('btn.go') }}
            </CommonBtnGradient>
          </div>
        </div>
      </transition>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod';

const supabase = useSupabaseClient();
const { auth } = useStore();
const toast = useAlerts();

const isLoading = ref(false);
const confirmEmail = ref(false);

const signInUp = async () => {
  if (isLoading.value || !isEmailValid(cred.email)
    || !isPasswordValid(cred.password)) { return; }
  try {
    isLoading.value = true;
    // Try to sign in directly. If it fails, fallback to sign up.
    const res = await supabase.auth.signInWithPassword({
      email: cred.email,
      password: cred.password,
    });
    logg(res, 'signin');
    if (!res.error && res.data) {
      auth.setUser(res.data);
      isLoading.value = false;
      return navigateTo('/');
    }

    // If sign-in failed, attempt to sign up
    const signup = await supabase.auth.signUp({
      email: cred.email,
      password: cred.password,
    });
    logg(signup, 'signup');
    if (!signup.error) {
      confirmEmail.value = true;
      isLoading.value = false;
      toast.login.confirmEmail();
      return;
    }
  } catch (e) {
    logg(e, 'error');
  }
  isLoading.value = false;
};

const emailSchema = z.string().email();
const passwordSchema = z.string().min(4);

const isEmailValid = (email: string) => {
  return emailSchema.safeParse(email).success;
};

const isPasswordValid = (password: string) => {
  return passwordSchema.safeParse(password).success;
};

const isPassInputDisabled = computed(() => {
  return isEmailValid(cred.email);
});

const isBtnDisabled = computed(() => {
  return isEmailValid(cred.email) && isPasswordValid(cred.password);
});

const cred = reactive({
  email: '',
  password: '',
});

const schema = z.object({
  email: z.string().email(),
});

const centerX = ref(0);
const centerY = ref(0);
const modalRect = ref({ width: 0, height: 0 });

onMounted(() => {
  const updateCenterPosition = () => {
    centerX.value = Math.max(0,
      (window.innerWidth - modalRect.value.width) / 2);
    centerY.value = Math.max(0,
      (window.innerHeight - modalRect.value.height) / 2);
  };
  updateCenterPosition();
  window.addEventListener('resize', updateCenterPosition);
  onUnmounted(() => {
    window.removeEventListener('resize', updateCenterPosition);
  });
});
</script>
