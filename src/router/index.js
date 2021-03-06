import Vue from "vue";
import VueRouter from "vue-router";
import store from "../store/index";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    beforeEnter: guard
  },
  {
    path: "/sign-up",
    name: "Sign Up",
    component: () =>
      import(/* webpackChunkName: "sign-up" */ "../views/SignUp.vue")
  },
  {
    path: "/login",
    name: "Sign In",
    component: () =>
      import(/* webpackChunkName: "sign-in" */ "../views/SignIn.vue")
  },
  {
    path: "/add-partner",
    name: "Add Partner",
    beforeEnter: guard,
    component: () =>
      import(/* webpackChunkName: "add-partner" */ "../views/AddPartner.vue")
  },
  {
    path: "/matches",
    name: "Matches",
    beforeEnter: guard,
    component: () =>
      import(/* webpackChunkName: "matches" */ "../views/Matches.vue")
  },
  {
    path: "/liked-movies",
    name: "Liked Movies",
    beforeEnter: guard,
    component: () =>
      import(/* webpackChunkName: "liked-movies" */ "../views/likedMovies.vue")
  },
  {
    path: "/disliked-movies",
    name: "Disliked Movies",
    beforeEnter: guard,
    component: () =>
      import(
        /* webpackChunkName: "disliked-movies" */ "../views/dislikedMovies.vue"
      )
  },
  {
    path: "/settings",
    name: "Settings",
    beforeEnter: guard,
    component: () =>
      import(/* webpackChunkName: "settings" */ "../views/Settings.vue")
  }
];

function guard(to, from, next) {
  if (store.state.user.id) {
    next();
  } else {
    next("/login");
  }
}

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
