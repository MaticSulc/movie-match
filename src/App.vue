<template>
  <v-app>
    <AppBar />
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import AppBar from "./components/appBar";
export default {
  name: "App",
  created() {
    document.title = "Movie Match";
  },

  components: {
    AppBar,
  },

  data: () => ({}),
  computed: {},
};
</script>
