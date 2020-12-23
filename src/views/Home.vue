<template>
  <div class="home">
    <v-card :loading="isLoading" class="mx-auto my-12" max-width="600">
      <template slot="progress">
        <v-progress-linear color="primary" height="10" indeterminate></v-progress-linear>
      </template>
          <v-row>
            <v-col md="6">
              <v-img :src="movieImage"></v-img>
            </v-col>
            <v-col md="6" class="mt-5">
              <v-card-title>{{currentMovie.title}}</v-card-title>
              <v-card-text>
                <v-row align="center" class="mx-0">
                  <div>{{currentMovie.overview}}</div>
                </v-row>
              </v-card-text>
              <v-card-actions>
                <v-row class="d-flex justify-space-around">
                  <v-btn color="green" @click="thumbsUp">
                    <v-icon>mdi-heart</v-icon>
                  </v-btn>
                  <v-btn color="red" @click="thumbsDown">
                    <v-icon>mdi-close-thick</v-icon>
                  </v-btn>
                </v-row>
              </v-card-actions>
            </v-col>
          </v-row>
    </v-card>
    <v-row>
      <v-col class="text-center">
        &copy; Matic Šulc
      </v-col>
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
  created(){
    this.$store.dispatch('user/bindMatchesRef');
    this.fetchMovies(this.movieApiPage);
  },
  watch:{
    $route (){
        this.fetchMovies(this.page, this.$route.query.genre);
    }
},
methods: {
    async fetchMovies(page, genre = '') {
      const res = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=e38f8031ec37d0ebadd751afc38a138e&language=en-US&sort_by=popularity.desc&include_adult=true&include_video=false&page=${page}&with_genres=${genre}`
      );
                  
      if (res.data && res.data.results.length > 0) {
        this.movies = res.data.results;
        this.currentIndex = -1;
        this.incrementCurrentIndex();
      }
    },
    async incrementCurrentIndex() {
      //check if it exists in liked/disliked, if it does increment by 1 (while s pogojem za to sranje za last entry v sebi)
      let userRef = db.collection("users").doc(this.authUserId);

      let likedMovies = await userRef.collection('likedMovies').get();
      let dislikedMovies = await userRef.collection('dislikedMovies').get();
      var likedMoviesArr = [];
      var dislikedMoviesArr = [];
      await likedMovies.forEach(async function(doc){
        let movieId = await doc.data().id;
        likedMoviesArr.push(movieId);
      });
      await dislikedMovies.forEach(async function(doc){
        let movieId = await doc.data().id;
        dislikedMoviesArr.push(movieId);
      });
    do{
      if (this.currentIndex === this.movieResultsLength - 1) {
        const newPage = this.movieApiPage += 1;
                this.fetchMovies(newPage);
        this.currentIndex = 0;
        this.currentMovie = this.movies[this.currentIndex];
      } 
      else {
        this.currentIndex++;
        this.currentMovie = this.movies[this.currentIndex];
      }
      
    }while(likedMoviesArr.includes(this.currentMovie.id) || dislikedMoviesArr.includes(this.currentMovie.id));

      


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

