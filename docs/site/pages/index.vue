<template>
  <div class="space-y-12">
    <HomeHero />
    <HomeProjects />
    
    <div class="mt-16 rounded-2xl border border-white/10 bg-white/5 p-8">
      <h2 class="mb-6 text-2xl font-bold text-white">
        Full Documentation
      </h2>
      <ContentDoc path="/README" v-slot="{ doc }">
        <article class="prose prose-invert max-w-none">
          <ContentRenderer :value="doc" />
        </article>

        <template #empty>
          <p class="text-slate-400">Documentation content not found.</p>
        </template>
      </ContentDoc>
    </div>
  </div>
</template>

