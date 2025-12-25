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
  class="kwami-glass-surface rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 transition"
  on:click={() => apply(!isDark)}
  aria-label="Toggle theme"
>
  {isDark ? 'Dark' : 'Light'}
</button>


