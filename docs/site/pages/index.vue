<template>
  <ContentDoc path="/README" v-slot="{ doc }">
    <DocArticle :doc="doc" />

    <template #empty>
      <DocNotFound />
    </template>
  </ContentDoc>
</template>

