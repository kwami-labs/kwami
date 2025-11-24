<template>
  <div class="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent p-12 text-center">
    <div class="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
    <div class="relative z-10">
      <div class="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-400/20 text-4xl text-emerald-300 shadow-lg">
        KW
      </div>
      <h1 class="text-5xl font-bold tracking-tight text-white sm:text-6xl">
        KWAMI Documentation
      </h1>
      <p class="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
        One knowledge base for every surface. Explore comprehensive documentation for the entire KWAMI ecosystem — from 3D characters to blockchain integration.
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-4">
        <UButton
          to="/1_kwami/getting-started/quickstart"
          size="lg"
          color="emerald"
          label="Get Started"
          icon="i-ph-rocket-launch-duotone"
          trailing
        />
        <UButton
          to="/1_kwami/ARCHITECTURE"
          size="lg"
          variant="outline"
          color="white"
          label="Architecture"
          icon="i-ph-tree-structure-duotone"
          trailing
        />
        <UButton
          href="https://github.com/kwami-io"
          target="_blank"
          size="lg"
          variant="ghost"
          color="white"
          label="GitHub"
          icon="i-ph-github-logo-duotone"
          trailing
        />
      </div>
    </div>
  </div>
</template>

