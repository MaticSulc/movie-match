<template>
  <div>
    <v-app-bar app color="#282828" dark>
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
        v-if="userId"
      ></v-app-bar-nav-icon>

      <div class="d-flex align-center">
        <router-link style="text-decoration: none; color: #fff" to="/"
          ><h2>Movie Match</h2></router-link
        >
      </div>

      <v-spacer></v-spacer>
      <v-btn v-if="userId" text href="mailto:matic.sulc1@student.um.si?subject=Bug Report - Movie Match">Report a bug</v-btn>
      <v-btn v-if="userId" @click="logoutUser" text>Logout</v-btn>
    </v-app-bar>
    <v-navigation-drawer
      app
      v-model="drawer"
      bottom
      temporary
      color="secondary"
    >
      <v-list-item nav>
        <v-list-item-content style="text-align: center">
          <span><br /></span>
        </v-list-item-content>
      </v-list-item>
      <v-treeview
        :items="items"
        open-on-click
        item-key="name"
        activatable
        transition
        class="primary--text"
      >
        <template slot="label" slot-scope="props">
          <div @click="redirect(props.item.href)">
            <v-icon color="red" v-text="props.item.icon" class="pr-2"></v-icon>
            <router-link
              style="text-decoration: none; color: #fff"
              :to="props.item.href"
              v-if="props.item.href"
              >{{ props.item.name }}</router-link
            >
            <span style="color: #fff" v-else>{{ props.item.name }}</span>
          </div>
        </template>
        </v-treeview>
    </v-navigation-drawer>
  </div>
</template>
<script>
import firebase from "firebase";
export default {
  data: () => ({
    drawer: false,
    items: [
      {
        name: "Home (All genres)",
        href: "/",
        icon: "mdi-home-outline",
      },
      {
        name: "Matches",
        href: "/matches",
        icon: "mdi-account-heart",
      },
      {
        name: "Add Partner",
        href: "/add-partner",
        icon: "mdi-account-plus",
      },
      {
        name: "Liked movies",
        href: "/liked-movies",
        icon: "mdi-heart",
      },
      {
        name: "Disliked movies",
        href: "/disliked-movies",
        icon: "mdi-close-thick",
      },

      {
        name: "Genres",
        icon: "mdi-movie",
        children: [
          {
            name: "Comedy",
            href: "/?genre=35",
          },
          {
            name: "Action",
            href: "/?genre=28",
          },
          {
            name: "Crime",
            href: "/?genre=80",
          },
          {
            name: "Documentary",
            href: "/?genre=99",
          },
          {
            name: "Drama",
            href: "/?genre=18",
          },
          {
            name: "History",
            href: "/?genre=36",
          },
          {
            name: "Horror",
            href: "/?genre=27,37",
          },
          {
            name: "Romance",
            href: "/?genre=10749",
          },
          {
            name: "Sci-Fi",
            href: "/?genre=878",
          },
        ],
      },
      {
        name: "Settings",
        href: "/settings",
        icon: "mdi-cog",
      },
    ],
  }),
  methods: {
    async logoutUser() {
      await firebase.auth().signOut();
      this.$store.dispatch("user/clearUserData");
      this.$router.replace("/login");
    },
    redirect(path) {
      if (!path) return;
      this.$router.replace(path).catch(() => {});
    },
  },

  computed: {
    userId() {
      return this.$store.state.user.id;
    },
  },
};
</script>
