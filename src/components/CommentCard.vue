<template>
  <article class="border-t-2 border-t-gray-300 pt-4 mb-4">
    <div class="flex flex-row">
      <p class="font-bold">
        {{ name }}
      </p>
      <p class="text-gray-500 mx-2">on {{ datetime }}</p>
    </div>
    <p class="mt-2 ml-2">
      <p v-for="paragraph in content_paragraphs" class="mb-2">
      {{ paragraph }}
    </p>
    </p>
  </article>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps(["name", "datetime", "content"]);
const content_paragraphs = computed(() => props.content?.split("\n"));
</script>
