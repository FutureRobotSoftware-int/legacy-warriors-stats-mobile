<template>
  <div v-if="isAuthorized" class="bg-base-300 w-full min-h-dvh flex flex-col">
    <Header />
    <main class="flex flex-1 w-full overflow-y-auto">
      <Main class="w-full" />
    </main>
  </div>

  <div
    v-else
    class="min-h-dvh flex items-center justify-center bg-base-200 px-4"
  >
    <div
      class="card bg-base-100 shadow-xl p-8 w-full max-w-md text-center animate-fade-in"
      :class="{ 'animate-exit': isExiting }"
    >
      <h2 class="text-2xl font-bold mb-2 text-error">Access Restricted</h2>
      <p class="text-base-content/70 mb-6">
        You must sign in with an approved Google account.
      </p>

      <div class="self-center">
        <div id="g_id_signin"></div>
      </div>

      <p class="mt-4 text-xs text-base-content/50">Authorized access only 🚫</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import Header from "./components/Header.vue";
import Main from "./components/Main.vue";

const isAuthorized = ref(false);
const isExiting = ref(false);

const allowedUsers = [
  "nicolas@futurerobot.dev",
  "gabriela@futurerobot.dev",
  "tomy@futurerobot.dev",
];

onMounted(() => {
  const logged = localStorage.getItem("auth") === "true";
  if (logged) {
    enterAuthorized();
    return;
  }

  google.accounts.id.initialize({
    client_id:
      "549637070928-11jfdb9g0dtpf1u7tii21ug16gmtc3rn.apps.googleusercontent.com",
    callback: handleCredentialResponse,
  });

  google.accounts.id.renderButton(document.getElementById("g_id_signin"), {
    theme: "filled_blue",
    size: "large",
    width: "300",
  });
});

function enterAuthorized() {
  isAuthorized.value = true;
}

async function handleCredentialResponse(response) {
  const payload = parseJwt(response.credential);
  const email = payload.email;

  if (allowedUsers.includes(email)) {
    localStorage.setItem("auth", "true");
    isExiting.value = true;

    await new Promise((res) => setTimeout(res, 350));
    enterAuthorized();
  } else {
    alert("Unauthorized.");
  }
}

function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}
</script>

<style>
.animate-exit {
  animation: fadeOutScale 0.35s forwards ease-in-out;
}

@keyframes fadeOutScale {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.85) translateY(-10px);
  }
}

.animate-fade-in {
  animation: fadeIn 0.35s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
