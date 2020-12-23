<template>
  <div class="home">
    <v-card :loading="isLoading" class="mx-auto my-12" max-width="600">
      <template slot="progress">
        <v-progress-linear
          color="primary"
          size="20"
          indeterminate
        ></v-progress-linear>
      </template>
      <v-row v-if="!isLoading">
        <v-col md="6">
          <v-img :src="movieImage"></v-img>
        </v-col>
        <v-col md="6" class="mt-5">
          <v-card-title>{{ currentMovie.title }}</v-card-title>
          <v-card-text>
            <v-row align="center" class="mx-0">
              <div>{{ currentMovie.overview }}</div>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-row class="d-flex justify-space-around">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="green " @click="thumbsUp">
                    <v-icon v-bind="attrs" v-on="on">mdi-heart</v-icon>
                  </v-btn>
                </template>
                <span>Like movie</span>
              </v-tooltip>
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="red" @click="thumbsDown">
                    <v-icon v-bind="attrs" v-on="on">mdi-close-thick</v-icon>
                  </v-btn>
                </template>
                <span>Dislike movie</span>
              </v-tooltip>
            </v-row>
          </v-card-actions>
        </v-col>
      </v-row>
    </v-card>
    <v-row>
      <v-col class="text-center"> &copy; Matic Šulc </v-col>
    </v-row>
  </div>
</template>

<script>
import { db } from "../main";
import axios from "axios";
export default {
  name: "Home",
  data: () => ({
    isLoading: false,
    movies: [],
    currentMovie: {},
    currentIndex: 0,
    movieApiPage: 1,
  }),
  created() {
    this.movieApiPage = 1;
    this.$store.dispatch("user/bindMatchesRef");
    if (this.$route.query.genre) {
      this.fetchMovies(this.movieApiPage, this.$route.query.genre);
    } else {
      this.fetchMovies(this.movieApiPage);
    }
  },
  watch: {
    $route() {
      this.movieApiPage = 1;
      this.fetchMovies(this.movieApiPage, this.$route.query.genre);
    },
  },
  methods: {
    async fetchMovies(page, genre = "") {
      console.log("fetchMovies " + this.isLoading);
      this.isLoading = true;
      const res = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=e38f8031ec37d0ebadd751afc38a138e&language=en-US&sort_by=popularity.desc&include_adult=true&include_video=false&page=${page}&with_genres=${genre}&append_to_response=videos`
      );

      if (res.data && res.data.results.length > 0) {
        let userRef = db.collection("users").doc(this.authUserId);
        let likedMovies = await userRef.collection("likedMovies").get();
        let dislikedMovies = await userRef.collection("dislikedMovies").get();
        var likedMoviesArr = [];
        var dislikedMoviesArr = [];
        await likedMovies.forEach(async function (doc) {
          let movieId = await doc.data().id;
          likedMoviesArr.push(movieId);
        });
        await dislikedMovies.forEach(async function (doc) {
          let movieId = await doc.data().id;
          dislikedMoviesArr.push(movieId);
        });

        this.movies = res.data.results;
        this.currentIndex = 0;
        if (
          likedMoviesArr.includes(this.movies[this.currentIndex].id) ||
          dislikedMoviesArr.includes(this.movies[this.currentIndex].id)
        ) {
          this.isLoading = true;
          await this.incrementCurrentIndex();
        } else {
          this.currentMovie = this.movies[this.currentIndex];
          this.isLoading = false;
        }
      }
    },
    async incrementCurrentIndex() {
      this.isLoading = true;
      let userRef = db.collection("users").doc(this.authUserId);
      let likedMovies = await userRef.collection("likedMovies").get();
      let dislikedMovies = await userRef.collection("dislikedMovies").get();
      var likedMoviesArr = [];
      var dislikedMoviesArr = [];
      await likedMovies.forEach(async function (doc) {
        let movieId = await doc.data().id;
        likedMoviesArr.push(movieId);
      });
      await dislikedMovies.forEach(async function (doc) {
        let movieId = await doc.data().id;
        dislikedMoviesArr.push(movieId);
      });
      do {
        this.isLoading = true;

        if (this.currentIndex === this.movieResultsLength - 1) {
          const newPage = await (this.movieApiPage += 1);
          await this.fetchMovies(newPage);
        } else {
          await this.currentIndex++;
        }
        this.currentMovie = await this.movies[this.currentIndex];
      } while (
        (await likedMoviesArr.includes(this.currentMovie.id)) ||
        (await dislikedMoviesArr.includes(this.currentMovie.id))
      );
      this.isLoading = false;
    },
    async thumbsUp() {
      let userRef = db.collection("users").doc(this.authUserId);

      await userRef.collection("likedMovies").add({ ...this.currentMovie });

      if (this.partnerId) {
        let partnerRef = db.collection("users").doc(this.partnerId);
        const partnerLikedSnapshot = await partnerRef
          .collection("likedMovies")
          .where("id", "==", this.currentMovie.id)
          .get();
        if (!partnerLikedSnapshot.empty) {
          await userRef.collection("matches").add({ ...this.currentMovie });
          await partnerRef.collection("matches").add({ ...this.currentMovie });
        }
      }
      this.incrementCurrentIndex();
    },
    async thumbsDown() {
      let userRef = db.collection("users").doc(this.authUserId);

      await userRef.collection("dislikedMovies").add({ ...this.currentMovie });
      this.incrementCurrentIndex();
    },
  },
  computed: {
    movieResultsLength() {
      return this.movies.length;
    },
    authUserId() {
      return this.$store.state.user.id;
    },
    partnerId() {
      return this.$store.state.user.partnerId;
    },
    movieImage() {
      return this.currentMovie.poster_path
        ? `https://image.tmdb.org/t/p/w500/${this.currentMovie.poster_path}`
        : "";
    },
  },
};
</script>

