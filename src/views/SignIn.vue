<template>
  <v-container>
    <v-card class="mx-auto" style="max-width: 450px">
      <v-overlay :value="isLoading">
        <v-progress-circular color="primary" indeterminate size="64">
        </v-progress-circular>
      </v-overlay>
      <v-form ref="form" v-model="form" class="pa-4 mt-6">
        <v-text-field
          v-model="email"
          :rules="[rules.required]"
          filled
          label="Email"
          type="email"
          autocomplete="email"
        ></v-text-field>
        <v-text-field
          v-model="password"
          :rules="[rules.required]"
          filled
          label="Password"
          type="password"
          style="min-height: 96px"
          autocomplete="password"
          @keyup.enter="signIn"
        ></v-text-field>
      </v-form>
      
      <v-alert v-if="errorMsg" border="top" color="red" class="ml-5 mr-5">
        {{ errorMsg }}
      </v-alert>
      
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn text to="/sign-up">Sign Up</v-btn>
        <v-btn text @click="resetPassword()">Reset Password</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="!form"
          color="primary"
          :loading="isLoading"
          depressed
          @click="signIn"
          >Sign In</v-btn
        >
      </v-card-actions>
    </v-card>
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
</template>

<script>
import firebase from "firebase";
import { db } from "../main";
export default {
  data: () => ({
    name: "",
    email: "",
    password: "",
    errorMsg: "",
    form: false,
    isLoading: false,
    showToast: false,
    toastMessage: "",
    toastColor: "",
    rules: {
      required: v => !!v || "This field is required."
    }
  }),
  methods: {
    async resetPassword() {
      var auth = firebase.auth();
      var that = this;
      let email = this.email;
      auth
        .sendPasswordResetEmail(email)
        .then(function() {
          that.showToast = true;
          that.toastMessage = "Password reset email has been sent.";
          that.toastColor = "green";
          that.email = "";
          that.password = "";
        })
        .catch(function(err) {
          that.showToast = true;
          that.toastMessage = err;
          that.toastColor = "red";
          that.password = "";
        });
    },
    async signIn() {
      this.isLoading = true;
      try {
        const authRes = await firebase
          .auth()
          .signInWithEmailAndPassword(this.email.toLowerCase(), this.password);

        const dbUser = await db
          .collection("users")
          .doc(authRes.user.uid)
          .get();

        const userData = dbUser.data();
        this.$store.dispatch("user/setUserData", {
          id: dbUser.id,
          name: userData.name,
          email: userData.email,
          partnerId: userData.partnerId || "",
          movieApiPage: userData.movieApiPage || 1
        });

        this.$router.replace({ name: "Home" });
      } catch (error) {
        this.errorMsg = "An error has occured!";
        if (error.message) {
          this.errorMsg = error.message;
        }
      }
      this.isLoading = false;
    }
  }
};
</script>
