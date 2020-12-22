<template>
  <div>
    <v-app-bar app color="secondary" dark>
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

      <v-btn v-if="userId" @click="logoutUser" text>Logout</v-btn>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" absolute bottom temporary>
     <v-treeview :items="items" open-on-click item-key="name" activatable transition class="primary--text">
        <template slot="label" slot-scope="props">
          <div @click="redirect(props.item.href)">
          <v-icon color="primary" v-text="props.item.icon" class="pr-2"></v-icon>
          <router-link
            style="text-decoration: none"
            :to="props.item.href"
            v-if="props.item.href"
          >{{ props.item.name }}</router-link>
          <span v-else>{{ props.item.name }}</span>
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
        id: 0,
        name: "Home (All genres)",
        href: "/",
        icon: "mdi-home-outline",
      },
      {
        id: 1,
        name: "Matches",
        href: "/matches",
        icon: "mdi-account-heart",
      },
      {
        id: 2,
        name: "Add Partner",
        href: "/add-partner",
        icon: "mdi-account-plus",
      },
            {
        id: 3,
        name: "Genres",
        icon: "mdi-movie",
         children: [
          {
            id: 4,
            name: "Sales",
            href: "/sales"
          },
          {
            id: 5,
            name: "Orders",
            href: "/orders"
          },
          {
            id: 6,
            name: "Inventory",
            href: "/inventory"
          }
        ],
      },
    ],
  }),
  methods: {
    async logoutUser() {
      await firebase.auth().signOut();
      this.$store.dispatch("user/clearUserData");
      this.$router.replace("/login");
    },
    redirect(path){
    this.$router.replace(path);
  },
  },
  
  computed: {
    userId() {
      return this.$store.state.user.id;
    },
  },
};
</script>
