<template>
  <article class="border-b-2 border-b-black pb-4 mb-4">
    <h2 class="font-bold text-2xl mb-2">
      <a :href="link">{{ title }}</a>
    </h2>
    <p v-for="paragraph in abstract_paragraphs" class="mb-2">
      {{ paragraph }}
    </p>
    <a :href="link" class="underline text-gray-500">Continue Reading</a>
  </article>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps({
  title: String,
  abstract: String,
  link: String,
});

const abstract_paragraphs = computed(() => props.abstract?.split("\n"));
</script>
