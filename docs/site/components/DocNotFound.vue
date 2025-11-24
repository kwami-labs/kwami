<template>
  <div
    class="rounded-3xl border border-red-500/20 bg-red-500/5 p-10 text-center shadow-inner"
  >
    <UIcon
      name="i-ph-warning-octagon-duotone"
      class="mx-auto text-5xl text-red-400"
    />
    <h1 class="mt-4 text-2xl font-semibold text-white">Document not found</h1>
    <p class="mt-2 text-base text-slate-300">
      We couldn’t locate the requested markdown file. It may have been moved or
      renamed.
    </p>
    <div class="mt-6 flex flex-wrap justify-center gap-3">
      <UButton to="/" color="emerald" label="Go back home" />
      <UButton
        variant="outline"
        color="white"
        label="Open docs root"
        to="/README"
      />
    </div>
  </div>
</template>

