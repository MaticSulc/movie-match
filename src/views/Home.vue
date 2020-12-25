<template>
  <div class="home">
    <v-card
      :loading="isLoading"
      class="mx-auto my-12"
      max-width="1000"
      style="background-color: #bebebe"
    >
      <template slot="progress">
        <v-progress-linear
          color="primary"
          size="20"
          indeterminate
        ></v-progress-linear>
      </template>
      <v-row v-if="!isLoading">
        <v-col md="5">
          <v-img class="d-block mt-0 mb-0 ml-auto mr-auto" style="width: 90%;" :src="movieImage"></v-img>
        </v-col>
        <v-col md="6" class="p-0">
          <v-card-title class="mb-n5 justify-md-start justify-center"
            >{{ currentMovie.title }}
            <span class="ml-1" v-if="this.currentMovie.release_date != ''">
              ({{ currentMovie.release_date.split("-")[0] }})</span
            ></v-card-title
          >
          <v-rating
            class="pl-2 text-center text-md-left"
            v-model="rating"
            background-color="gray lighten-2"
            color="gray lighten-2"
            size="30"
            half-increments
            readonly
          ></v-rating>
          <v-card-text>
            <v-row align="center" class="mx-0">
              <div class="text-justify">{{ currentMovie.overview }}</div>
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
          <Youtube v-if="this.trailerUrl != ''" class="ml-lg-5 " :videoId="trailerUrl" maxWidth="500px" />
          <v-img v-else class="ml-5 mr-5 mt-5" :src="backdrop"></v-img>
          

        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>
import { db } from "../main";
import axios from "axios";
import Youtube from "../components/Youtube"
const movieTrailer = require("movie-trailer");
export default {
  name: "Home",
    components: {
    Youtube,
  },
  data: () => ({
    isLoading: false,
    movies: [],
    currentMovie: {},
    currentIndex: 0,
    movieApiPage: 1,
    trailerUrl: "",
    rating: 0,
    backdrop: "",
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
  updated() {
    this.syncMatches();
  },
  watch: {
    $route() {
      this.movieApiPage = 1;
      this.fetchMovies(this.movieApiPage, this.$route.query.genre);
    },
  },
  methods: {
    async syncMatches() {
      let auserRef = db.collection("users").doc(this.authUserId);
      let alikedMovies = await auserRef.collection("likedMovies").get();
      let amatches = await auserRef.collection("matches").get();
      let alikedMoviesArr = [];
      let amatchesArr = [];
      await alikedMovies.forEach(async function (doc) {
        let movie = await doc.data();
        alikedMoviesArr.push(movie);
      });
      await amatches.forEach(async function (doc) {
        let movie = await doc.data();
        amatchesArr.push(movie);
      });
      if (this.partnerId) {
        let apartnerRef = db.collection("users").doc(this.partnerId);
        let apartnerLikedMovies = await apartnerRef
          .collection("likedMovies")
          .get();
        let apartnerLikedMoviesArr = [];
        let apartnerMatchesArr = [];
        await apartnerLikedMovies.forEach(async function (doc) {
          let movieId = await doc.data().id;
          apartnerLikedMoviesArr.push(movieId);
        });
        await amatches.forEach(async function (doc) {
          let movie = await doc.data();
          apartnerMatchesArr.push(movie);
        });

        const foundMatches = alikedMoviesArr.filter((element) =>
          apartnerLikedMoviesArr.includes(element.id)
        );
        foundMatches.forEach(async (el) => {
          let foundMatch = false;
          let foundMatchPartner = false;

          for (let i = 0; i < amatchesArr.length; i++) {
            if (amatchesArr[i].id == el.id) {
              foundMatch = true;
              break;
            }
          }
          for (let j = 0; j < apartnerMatchesArr.length; j++) {
            if (apartnerMatchesArr[j].id == el.id) {
              foundMatchPartner = true;
              break;
            }
          }
          if (!foundMatch) {
            await auserRef.collection("matches").add({ ...el });
          }
          if (!foundMatchPartner) {
            await apartnerRef.collection("matches").add({ ...el });
          }
        });
      }
    },
    async fetchMovies(page, genre = "") {
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
          await this.getTrailerUrlRating();
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
      await this.getTrailerUrlRating();
      this.isLoading = false;
    },
    async thumbsUp() {
      let userRef = db.collection("users").doc(this.authUserId);
      await userRef.collection("likedMovies").add({ ...this.currentMovie });
      this.incrementCurrentIndex();
    },
    async thumbsDown() {
      let userRef = db.collection("users").doc(this.authUserId);
      await userRef.collection("dislikedMovies").add({ ...this.currentMovie });
      this.incrementCurrentIndex();
    },
    async getTrailerUrlRating() {
      await movieTrailer(this.currentMovie.title, { id: true })
        .then(async (res) => {
          this.trailerUrl = res;
        })
        .catch(() => {
          this.trailerUrl = "";
        });

      let rating = this.currentMovie.vote_average;
      this.rating = rating / 2;
      this.backdrop =
        "https://image.tmdb.org/t/p/w500/" + this.currentMovie.backdrop_path;
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
