import useLangs from '~/composables/useLangs';
import useKwami from '~/stores/q';
import useAuth from '~/stores/auth';
import useUI from '~/stores/ui';

export default function useStore () {
  return {
    langs: useLangs(),
    q: useKwami(),
    auth: useAuth(),
    ui: useUI()
  };
}
