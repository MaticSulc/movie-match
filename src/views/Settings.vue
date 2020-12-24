<template>
  <div>
    <v-overlay :value="isLoading">
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
    <v-container>
      <v-row>
        <v-col md="6">
          <v-card class="mx-auto">
            <v-container>
              <h2>User settings</h2>
              <v-row>
                <v-form ref="form" v-model="form">
                  <v-col class="d-inline-flex">
                    <v-text-field
                      v-model="username"
                      filled
                      label="Name"
                      type="text"
                      class="mr-5"
                      v-bind:placeholder="username"
                    ></v-text-field>
                    <v-text-field
                      v-model="email"
                      :rules="[rules.email]"
                      filled
                      label="E-mail"
                      type="email"
                      class="mr-5"
                      v-bind:placeholder="email"
                    ></v-text-field>
                    <v-btn
                      @click="updateUserData()"
                      :disabled="!form"
                      large
                      color="primary"
                      class="ml-2 mt-2"
                      >Save</v-btn
                    >
                  </v-col>
                </v-form>
              </v-row>
            </v-container>
          </v-card>
        </v-col>

        <v-col md="6">
          <v-card class="mx-auto">
            <v-container>
              <h2>Data settings</h2>
              <v-row>
                <v-form ref="form" v-model="form">
                  <v-col>
                    <v-btn
                      @click="clearLikedMovies()"
                      large
                      color="primary"
                      class="ml-2 mt-2"
                      >Clear liked movies</v-btn
                    >
                    <v-btn
                      @click="clearDislikedMovies()"
                      large
                      color="primary"
                      class="ml-2 mt-2"
                      >Clear disliked movies</v-btn
                    >
                    <v-btn
                      @click="clearMatches()"
                      large
                      color="primary"
                      class="ml-2 mt-2"
                      >Clear matches</v-btn
                    >
                  </v-col>
                  <v-col>
                    <v-btn
                      @click="clearAllData()"
                      large
                      color="primary"
                      class="ml-2 mt-2"
                      >Clear all data</v-btn
                    >
                  </v-col>
                </v-form>
              </v-row>
            </v-container>
          </v-card>
        </v-col>
      </v-row>
      <v-snackbar
        :timeout="4000"
        :value="showToast"
        absolute
        bottom
        right
        :color="toastColor"
        >{{ toastMessage }}</v-snackbar
      >
    </v-container>
  </div>
</template>

<script>
import { db } from "../main";
export default {
  created() {
    this.getUserData();
  },
  data: () => ({
    form: false,
    isLoading: false,
    showToast: false,
    toastColor: "",
    toastMessage: "",
    username: "",
    email: "",
    rules: {
      email: v => !!(v || "").match(/@/) || "Please enter a valid email."
    }
  }),
  methods: {
    async clearLikedMovies() {
      let userRef = db.collection("users").doc(this.authUserId);
      let likedMovies = await userRef.collection("likedMovies").get();
      var likedMoviesArr = [];
      await likedMovies.forEach(async function(doc) {
        let movieData = await doc.data();
        likedMoviesArr.push(movieData.id);
      });
      likedMoviesArr.forEach(async id => {
        const doc = await userRef
          .collection("likedMovies")
          .where("id", "==", id)
          .get();
        doc.forEach(el => {
          el.ref.delete();
        });
      });
      this.toastColor = "green";
      this.toastMessage = "Liked movies cleared.";
      this.showToast = true;
    },
    async clearDislikedMovies() {
      let userRef = db.collection("users").doc(this.authUserId);
      let dislikedMovies = await userRef.collection("dislikedMovies").get();
      var dislikedMoviesArr = [];
      await dislikedMovies.forEach(async function(doc) {
        let movieData = await doc.data();
        dislikedMoviesArr.push(movieData.id);
      });
      dislikedMoviesArr.forEach(async id => {
        const doc = await userRef
          .collection("dislikedMovies")
          .where("id", "==", id)
          .get();
        doc.forEach(el => {
          el.ref.delete();
        });
      });
      this.toastColor = "green";
      this.toastMessage = "Disliked movies cleared.";
      this.showToast = true;
    },
    async clearMatches() {
      let userRef = db.collection("users").doc(this.authUserId);
      let matches = await userRef.collection("matches").get();
      var matchesArr = [];
      await matches.forEach(async function(doc) {
        let movieData = await doc.data();
        matchesArr.push(movieData.id);
      });
      matchesArr.forEach(async id => {
        const doc = await userRef
          .collection("matches")
          .where("id", "==", id)
          .get();
        doc.forEach(el => {
          el.ref.delete();
        });
      });
      this.toastColor = "green";
      this.toastMessage = "Matches cleared.";
      this.showToast = true;
    },
    async clearAllData() {
      await this.clearLikedMovies();
      await this.clearDislikedMovies();
      await this.clearMatches();
    },
    async updateUserData() {
      const authUserId = this.$store.state.user.id;
      const ref = db.collection("users").doc(authUserId);
      ref
        .update({ email: this.email, name: this.username })
        .then(
          (this.toastColor = "green"),
          (this.toastMessage = "User settings updated."),
          (this.showToast = true)
        )
        .catch(function(error) {
          console.log("Error getting cached document:", error);
        });
    },

    async getUserData() {
      const self = this;
      const authUserId = this.$store.state.user.id;
      const ref = db.collection("users").doc(authUserId);
      var getOptions = {
        source: "server"
      };
      ref
        .get(getOptions)
        .then(async function(doc) {
          self.username = doc.data().name;
          self.email = doc.data().email;
        })
        .catch(function(error) {
          console.log("Error getting cached document:", error);
        });
    }
  },
  computed: {
    authUserId() {
      return this.$store.state.user.id;
    }
  }
};
</script>
