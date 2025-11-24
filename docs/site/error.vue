<template>
  <UApp>
    <div class="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div class="w-full max-w-2xl text-center">
        <div
          class="rounded-3xl border border-white/5 bg-white/5 p-12 shadow-xl"
        >
          <UIcon
            name="i-ph-warning-circle-duotone"
            class="mx-auto text-6xl text-red-400"
          />
          <h1 class="mt-6 text-4xl font-bold text-white">
            {{ error?.statusCode === 404 ? 'Page Not Found' : 'An Error Occurred' }}
          </h1>
          <p class="mt-4 text-lg text-slate-300">
            {{
              error?.statusCode === 404
                ? "The page you're looking for doesn't exist or has been moved."
                : error?.message || 'Something went wrong while loading this page.'
            }}
          </p>

          <div class="mt-8 flex flex-wrap justify-center gap-4">
            <UButton
              to="/"
              color="emerald"
              size="lg"
              label="Go Home"
              icon="i-ph-house-duotone"
            />
            <UButton
              variant="outline"
              color="white"
              size="lg"
              label="View Documentation"
              icon="i-ph-book-open-duotone"
              to="/README"
            />
          </div>

          <div
            v-if="error?.statusCode !== 404"
            class="mt-8 rounded-xl border border-white/10 bg-slate-900/50 p-4 text-left"
          >
            <p class="text-xs font-mono text-slate-400">
              {{ error?.statusMessage || 'Unknown error' }}
            </p>
          </div>
        </div>

        <div class="mt-6">
          <UButton
            variant="ghost"
            color="white"
            label="Report Issue"
            icon="i-ph-github-logo-duotone"
            target="_blank"
            href="https://github.com/kwami-io/kwami/issues"
          />
        </div>
      </div>
    </div>
  </UApp>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

useHead({
  title: 'Error',
  htmlAttrs: {
    lang: 'en',
    class: 'scroll-smooth'
  }
})
</script>

