<template>
  <div id="login">
    <div id="g_id_signin"></div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";

// Allowed Emails
const allowedUsers = [
  "nicolas@futurerobot.dev",
  "itsupport@bballbreakdown.com",
  "coachnick@bballbreakdown.com",
];

onMounted(() => {
  /* global google */
  google.accounts.id.initialize({
    client_id:
      "549637070928-11jfdb9g0dtpf1u7tii21ug16gmtc3rn.apps.googleusercontent.com",
    callback: handleCredentialResponse,
  });

  google.accounts.id.renderButton(document.getElementById("g_id_signin"), {
    theme: "outline",
    size: "large",
  });
});

function handleCredentialResponse(response) {
  const payload = parseJwt(response.credential);
  const email = payload.email;

  if (allowedUsers.includes(email)) {
    localStorage.setItem("auth", "true");
    window.location.href = "/app"; // o donde tengas tu web
  } else {
    alert("No authorized.");
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
