<template>
  <v-app>
    <AppBar />
    <v-main
      :style="{
        backgroundImage: 'url(' + require('@/assets/bg_light.png') + ')',
        backgroundSize: 'cover',
        backgroundColor: '#282828	',
        backgroundPosition: 'center',
      }"
    >
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
