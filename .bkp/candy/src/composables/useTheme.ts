import { ref, onMounted, watch } from 'vue'

export const useTheme = () => {
  // Initialize with system preference or localStorage
  const isDark = ref(true) // Default to dark for now as it's the original design

  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  const updateHtmlClass = () => {
    const html = document.documentElement
    if (isDark.value) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  onMounted(() => {
    // Check localStorage
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      // Check system preference
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      isDark.value = systemDark
    }
    
    // Apply initial theme
    updateHtmlClass()
  })

  watch(isDark, () => {
    updateHtmlClass()
  })

  return {
    isDark,
    toggleTheme
  }
}
