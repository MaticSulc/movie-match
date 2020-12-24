<template>
  <v-container>
    <v-row>
      <v-col md="6" v-for="movie in likedMovies" :key="movie.id">
        <v-card class="mx-auto">
          <v-container>
            <v-row>
              <v-col md="8">
                <v-list-item-title class="headline mb-1">{{
                  movie.title
                }}</v-list-item-title>
                <p>
                  {{ movie.overview }}
                </p>
                <v-btn @click="removeMovie(movie.id)">Remove</v-btn>
              </v-col>
              <v-col md="4">
                <v-img :src="getMovieImage(movie.poster_path)"></v-img>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { db } from "../main";
export default {
  data() {
    return {
      likedMovies: []
    };
  },
  methods: {
    async removeMovie(id) {
      let userRef = db.collection("users").doc(this.authUserId);
      const doc = await userRef
        .collection("likedMovies")
        .where("id", "==", id)
        .get();
      doc.forEach(el => {
        el.ref.delete();
      });
      this.getMovies();
    },
    getMovieImage(poster_path) {
      return poster_path
        ? `https://image.tmdb.org/t/p/w500/${poster_path}`
        : "";
    },
    async getMovies() {
      let userRef = db.collection("users").doc(this.authUserId);
      let likedMovies = await userRef.collection("likedMovies").get();
      var likedMoviesArr = [];
      await likedMovies.forEach(async function(doc) {
        let movieData = await doc.data();
        likedMoviesArr.push(movieData);
      });
      this.likedMovies = likedMoviesArr;
    }
  },
  async created() {
    this.getMovies();
  },
  computed: {
    authUserId() {
      return this.$store.state.user.id;
    }
  }
};
</script>
