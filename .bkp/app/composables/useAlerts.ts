export default function useAlerts () {
  const toast = useToast();
  const { t } = useI18n();
  return {
    login: {
      confirmEmail: () => toast.add({
        title: t('toast.confirmEmail.name'),
        description: t('toast.confirmEmail.desc'),
        icon: 'i-heroicons-lock-open-20-solid',
        color: 'green'
      })
    }
  };
}
