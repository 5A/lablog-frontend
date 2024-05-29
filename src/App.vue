<template>
  <div class="flex flex-col sm:flex-row">
    <div class="flex-auto">
      <template v-for="(post, index) in posts_filtered">
        <ArticlePreviewCard
          v-if="
            page_index * items_per_page <= index &&
            index < (page_index + 1) * items_per_page
          "
          :key="post.post_id"
          :title="post.title"
          :abstract="post.abstract"
          :link="post.link"
        />
      </template>
      <div class="flex flex-row justify-between">
        <!-- Pagination Section -->
        <div class="relative left-0 flex flex-row flex-nowrap">
          <button @click="page_index = page_index > 0 ? page_index - 1 : 0">
            <ArrowLeftCircleIcon class="size-6 text-gray-500" />
          </button>
          <button
            @click="
              page_index =
                page_index < n_displayed_pages - 1
                  ? page_index + 1
                  : n_displayed_pages - 1
            "
          >
            <ArrowRightCircleIcon class="size-6 text-gray-500" />
          </button>
        </div>
        <div class="relative right-0 ml-4">
          <template v-for="page_number in n_displayed_pages">
            <button @click="page_index = page_number - 1" class="px-1 mx-1">
              <p
                :class="{
                  'font-bold': true,
                  underline: page_index == page_number - 1,
                }"
              >
                {{ page_number }}
              </p>
            </button>
          </template>
        </div>
      </div>
    </div>
    <aside class="sm:max-w-60 min-w-60">
      <!-- Catagories side panel -->
      <div
        class="mt-8 ml-0 mb-8 pt-2 sm:mt-0 sm:ml-8 border-t-4 border-t-black"
      >
        <h2 class="font-bold mb-2">CATAGORIES</h2>
        <ul class="ml-2">
          <li v-for="catagory in catagories">
            <button
              @click="on_select_catagory(catagory)"
              :class="{ underline: catagory_selected == catagory }"
            >
              {{ catagory }}
            </button>
          </li>
        </ul>
      </div>
      <!-- About side panel -->
      <div
        class="mt-8 ml-0 mb-8 pt-2 sm:mt-0 sm:ml-8 border-t-4 border-t-black"
      >
        <h2 class="font-bold mb-2">ABOUT</h2>
        <ul class="ml-2">
          <li>
            <a href="/pages/about.html">About Zhi Zi</a>
          </li>
          <li>
            <a href="/pages/pubkey.html">PGP Public Key</a>
          </li>
          <li>
            <a href="/pages/copyright.html">Copyright</a>
          </li>
          <li>
            <a href="/pages/privacy.html">Privacy Policy</a>
          </li>
        </ul>
      </div>
      <!-- Pages side panel -->
      <div
        class="mt-8 ml-0 mb-8 pt-2 sm:mt-0 sm:ml-8 border-t-4 border-t-black"
      >
        <h2 class="font-bold mb-2">PAGES</h2>
        <ul class="ml-2">
          <li>
            <a href="/pages/links.html">Internal Links</a>
          </li>
          <li>
            <a href="/pages/memoranda.html">Online Memoranda</a>
          </li>
          <li></li>
        </ul>
      </div>
      <!-- Tags side panel -->
      <div
        class="mt-8 ml-0 mb-8 pt-2 sm:mt-0 sm:ml-8 border-t-4 border-t-black"
      >
        <div class="flex flex-row justify-between">
          <h2 class="font-bold mb-2">TAGS</h2>
          <button
            v-if="tags_selected.length"
            class="mb-2 mx-2 underline relative right-0"
            @click="on_clear_selected_tags()"
          >
            clear
          </button>
        </div>
        <div class="flex flex-row flex-wrap">
          <template v-for="tag in tags">
            <button
              class="rounded-md py-1 px-2 m-1"
              :class="{
                'bg-gray-200': !tag_toggle_states[tag],
                'bg-black': tag_toggle_states[tag],
                'text-white': tag_toggle_states[tag],
              }"
              @click="on_toggle_tag(tag)"
            >
              {{ tag }}
            </button>
          </template>
        </div>
      </div>
    </aside>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/vue/24/outline";

import ArticlePreviewCard from "@/components/ArticlePreviewCard.vue";

const posts = ref<Array<any>>([]);
const catagories = ref<Array<string>>([]);
const catagory_selected = ref<string>("");
const tags = ref<Array<string>>([]);
const tag_toggle_states = ref<Record<string, boolean>>({});
const tags_selected = ref<Array<string>>([]);
const posts_filtered = computed(() => {
  return posts.value
    .filter((post) => {
      if (catagory_selected.value == "") {
        return true;
      } else {
        return post.catagory == catagory_selected.value;
      }
    })
    .filter((post) => {
      if (tags_selected.value.length == 0) {
        return true;
      } else {
        for (const post_tag of post.tags) {
          if (tags_selected.value.includes(post_tag)) {
            return true;
          }
        }
        return false;
      }
    });
});

const items_per_page = 10;
// const n_items = computed(() => posts.value.length);
const n_displayed_items = computed(() => posts_filtered.value.length);
// const n_pages = computed(() => Math.ceil(n_items.value / items_per_page));
const n_displayed_pages = computed(() =>
  Math.ceil(n_displayed_items.value / items_per_page)
);
const page_index = ref<number>(0);

function load_blog_data() {
  try {
    console.log("Loading posts data from api server");
    fetch("/posts.json", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      if (response.ok) {
        response.json().then((result) => {
          // success, construct local data.
          console.log("RESTful online, got response: ", result);
          posts.value = [];
          catagories.value = [];
          tags.value = [];
          for (const [i, post] of result.posts.entries()) {
            // put posts data into ref and sort it
            const to_append = { ...post, rank: i, display: true };
            posts.value.push(to_append);
            // check catagories
            if (!catagories.value.includes(post.catagory)) {
              catagories.value.push(post.catagory);
            }
            // check tags
            for (const tag of post.tags) {
              if (!tags.value.includes(tag)) {
                tags.value.push(tag);
                tag_toggle_states.value[tag] = false;
              }
            }
          }
        });
      } else {
        // Got abnormal response code.
        console.log(
          "Server reported an issue, HTTP Response Code: ",
          response.status
        );
      }
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      // Got abnormal data.
      console.log("Remote returned non-json data.");
    } else if (error instanceof TypeError) {
      // Service down.
      console.log("Fetching remote resource failed, probably disconnected");
    } else {
      // Other errors, probably user canceled request or network change.
      console.log("Unexpected error", error);
    }
  }
}

load_blog_data();

function on_select_catagory(catagory: string) {
  if (catagory_selected.value == catagory) {
    // if clicked on already selected catagory, then go back to no catagory filter
    catagory_selected.value = "";
    return;
  }
  catagory_selected.value = catagory;
  // reset pagination
  page_index.value = 0;
}

function on_toggle_tag(selected_tag: string) {
  tag_toggle_states.value[selected_tag] =
    !tag_toggle_states.value[selected_tag];
  tags_selected.value = [];
  for (const tag of tags.value) {
    if (tag_toggle_states.value[tag]) {
      tags_selected.value.push(tag);
    }
  }
  // reset pagination
  page_index.value = 0;
}

function on_clear_selected_tags() {
  for (const tag of tags.value) {
    tag_toggle_states.value[tag] = false;
  }
  tags_selected.value = [];
  // reset pagination
  page_index.value = 0;
}
</script>
