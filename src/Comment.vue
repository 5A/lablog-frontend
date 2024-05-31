<template>
  <h2 class="font-bold text-2xl mb-2 pb-4 border-black">
    Comments ({{ is_comment_loading ? "Loading" : comments.length }})
  </h2>
  <template v-for="comment in comments">
    <CommentCard
      :name="comment.name"
      :datetime="comment.datetime"
      :content="comment.content"
    />
  </template>
  <div class="mt-8 ml-0 border-t-4 border-t-black">
    <h2 class="font-bold my-2">LEAVE A COMMENT</h2>
    <div class="flex flex-col gap-2">
      <label class="block">
        <span class="text-gray-700">Comment content:</span>
        <textarea
          class="mt-0 block w-full px-0.5 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-black"
          rows="4"
          v-model="comment_content"
        ></textarea>
      </label>
      <label class="block">
        <span class="text-gray-700">Your name please:</span>
        <input
          type="text"
          class="mt-0 block w-full px-0.5 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-black"
          placeholder=""
          v-model="comment_name"
        />
      </label>
      <label class="block">
        <span class="text-gray-700">Email address:</span>
        <input
          type="email"
          class="mt-0 block w-full px-0.5 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-black"
          placeholder=""
          v-model="comment_email"
        />
      </label>
      <div class="flex flex-row justify-between items-center mt-2">
        <label class="inline-flex items-center">
          <input
            type="checkbox"
            class="rounded bg-gray-200 border-transparent focus:border-transparent focus:bg-gray-200 text-gray-700 focus:ring-1 focus:ring-offset-2 focus:ring-gray-500"
            v-model="comment_agreement"
          />
          <span class="ml-2"
            >I have read and agree with the
            <a href="/pages/commenting.html" class="underline"
              >commenting rules and notices</a
            ></span
          >
        </label>
        <button
          class="mr-2 px-2 py-1 rounded-lg bg-black text-white font-bold flex-none relative right-0 disabled:bg-gray-500"
          @click="
            on_submit_comment(
              comment_name,
              comment_content,
              comment_email,
              comment_agreement
            )
          "
          :disabled="is_comment_submitting"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import CommentCard from "./components/CommentCard.vue";

const post_id = document.getElementById("post-id")?.textContent;
const comments_location =
  document.getElementById("comments-location")?.textContent;
const comments = ref<Array<any>>([]);
const comment_content = ref<string>("");
const comment_name = ref<string>("");
const comment_email = ref<string>("");
const comment_agreement = ref<boolean>(false);
const is_comment_loading = ref<boolean>(true);
const is_comment_submitting = ref<boolean>(false);

function load_comment_data() {
  if (!comments_location) {
    return;
  }
  try {
    console.log("Loading comments data from api server");
    fetch(comments_location, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      if (response.ok) {
        response.json().then((result) => {
          // success, construct local data.
          console.log("RESTful online, got response: ", result);
          comments.value = [];
          for (const [i, comment] of result.comments.entries()) {
            // put comments data into ref and sort it
            const to_append = {
              ...comment,
              rank: i,
              datetime: new Date(
                comment.created_timestamp * 1000
              ).toLocaleString(),
            };
            comments.value.push(to_append);
          }
          is_comment_loading.value = false;
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

load_comment_data();

const COMMENT_AGREEMENT_ALERT = `Error: Please Agree to the Commenting Agreements

To ensure a respectful and constructive environment, \
we require all users to agree to our commenting agreements before posting. \
Please check the checkbox to indicate your agreement. \
Thank you for helping us maintain a positive community!
`;

const COMMENT_TOO_LONG_ALERT = `Error: Comment Too Long.

We're glad you have a lot to say! However, your comment is a bit too lengthy. \
Long comments can be disruptive to other users' attention and affect the styling of our website. \
Please shorten your comment or consider posting it in several sections. \
Thank you for your understanding and cooperation!

(Maximum length of a single comment is limited to 4096 characters.)
`;

function on_submit_comment(
  name: string,
  content: string,
  email: string,
  user_agree: boolean
) {
  if (!post_id || !comments_location) {
    return;
  }
  if (!user_agree) {
    window.alert(COMMENT_AGREEMENT_ALERT);
    return;
  }
  if (content.length > 4096) {
    window.alert(COMMENT_TOO_LONG_ALERT);
    return;
  }
  is_comment_submitting.value = true;
  try {
    console.log("Submitting comment to API server");
    fetch(comments_location, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        content: content,
        contact_address: email,
      }),
    }).then((response) => {
      if (response.ok) {
        response.json().then((result) => {
          // success, reload comment data.
          console.log("RESTful online, got response: ", result);
          load_comment_data();
          comment_content.value = "";
        });
      } else {
        // Got abnormal response code.
        console.log(
          "Server reported an issue, HTTP Response Code: ",
          response.status
        );
      }
      // Normal termination of network request
      is_comment_submitting.value = false;
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
    // Abnormal termination of network request
    is_comment_submitting.value = false;
  }
}
</script>
