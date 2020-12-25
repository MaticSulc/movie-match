import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import firebase from "firebase";
import VueYouTubeEmbed from "vue-youtube-embed";

Vue.config.productionTip = false;

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
  apiKey: "AIzaSyBrTgrjqOoEN2f3lOPMFsvVCxD3YyuijZo",
  authDomain: "movie-match-6fa66.firebaseapp.com",
  projectId: "movie-match-6fa66",
  storageBucket: "movie-match-6fa66.appspot.com",
  messagingSenderId: "416032846639",
  appId: "1:416032846639:web:9186fc6b88bda938e627da",
  measurementId: "G-2FWJLP7RC9"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

export const db = firebase.firestore();

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
Vue.use(VueYouTubeEmbed);
