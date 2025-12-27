<script lang="ts">
  import { onMount } from 'svelte'

  let isDark = true

  const apply = (next: boolean) => {
    isDark = next
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('kwami-theme', next ? 'dark' : 'light')
    } catch {
      // ignore
    }
  }

  onMount(() => {
    try {
      const stored = localStorage.getItem('kwami-theme')
      if (stored === 'light') apply(false)
      else if (stored === 'dark') apply(true)
      else apply(true)
    } catch {
      apply(true)
    }
  })
</script>

<button
  type="button"
  class="kwami-glass-surface rounded-full border border-gray-200/60 bg-white/15 px-3 py-2 text-xs font-semibold tracking-wider text-gray-700 hover:bg-white/20 transition dark:border-gray-800/60 dark:bg-black/15 dark:text-gray-200 dark:hover:bg-black/20"
  on:click={() => apply(!isDark)}
  aria-label="Toggle theme"
>
  {isDark ? 'Dark' : 'Light'}
</button>


