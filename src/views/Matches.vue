<template>
  <v-container>
    <v-row>
      <v-col md="6" v-for="match in matches" :key="match.id">
        <v-card class="mx-auto" v-bind:style="[match.watched ? {'backgroundColor': '#808080'} : {'backgroundColor': '#fff'}]">
          <v-container>
            <v-row>
              <v-col md="8">
                <v-list-item-title class="headline mb-1">{{
                  match.title
                }}</v-list-item-title>
                <p>
                  {{ match.overview }}
                </p>
                <v-btn v-if="!match.watched"
                  :id="match.id"
            color="secondary"
            depressed
            v-on:click="markFinished($event, true)"
            >Watched</v-btn
          >
          <v-btn v-else
                  :id="match.id"
            color="secondary"
            depressed
            v-on:click="markFinished($event, false)"
            >Undo</v-btn
          >
              </v-col>
              <v-col md="4">
                <v-img :src="getMovieImage(match.poster_path)"></v-img>
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
  created(){
    this.$store.dispatch("user/bindMatchesRef");
  },
  methods: {
    async markFinished(event, state){
          let targetId = event.currentTarget.id;
          const userRef = db.collection("users").doc(this.authUserId);
          const docRef = await userRef.collection("matches").doc(targetId);
          const res = await docRef.update({watched:state});
          console.log(res);
    },
    getMovieImage(poster_path) {
      return poster_path
        ? `https://image.tmdb.org/t/p/w500/${poster_path}`
        : "";
    }
  },
  computed: {
    matches() {
      return this.$store.state.user.matches;
    },
    authUserId() {
      return this.$store.state.user.id;
    },
  }
};
</script>
