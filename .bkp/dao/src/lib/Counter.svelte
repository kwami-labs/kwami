<script lang="ts">
  let count = $state(0)
</script>

<button
  class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/70"
  type="button"
  onclick={() => (count += 1)}
>
  count is {count}
</button>


