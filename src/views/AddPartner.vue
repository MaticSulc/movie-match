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
      <v-card color="rgb(255,255,255,0.9)">
        <v-container>
          <h2>Partner Search</h2>
          <p>Search for your partner by e-mail.</p>
          <p>
            Current partner: {{ currentPartnerName }} -
            {{ currentPartnerEmail }}
          </p>
          <v-row>
            <v-form ref="form" v-model="form">
              <v-col class="d-inline-flex">
                <v-text-field
                  v-model="email"
                  :rules="[rules.email]"
                  filled
                  label="E-mail"
                  type="email"
                ></v-text-field>
                <v-btn
                  @click="searchPartner"
                  :disabled="!form"
                  large
                  color="primary"
                  class="ml-2 mt-2"
                  >Search</v-btn
                >
              </v-col>
            </v-form>
          </v-row>
          <v-row v-if="foundUser">
            <v-col class="d-inline-flex">
              <v-card>
                <v-card-text>
                  <div>
                    {{ foundUser.email }}
                  </div>
                  <p class="display-1 text-primary">{{ foundUser.name }}</p>
                  <div class="text-primary">
                    To add this user click the button
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="primary" @click="addPartner(foundUser.id)"
                    >Add</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
          <v-row v-if="message">
            <v-col>
              <h3>{{ message }}</h3>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
      <v-snackbar
        :timeout="2500"
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
    this.getPartnerData();
  },
  data: () => ({
    form: false,
    isLoading: false,
    showToast: false,
    toastColor: "",
    toastMessage: "",
    email: "",
    foundUser: null,
    message: "",
    currentPartnerName: "",
    currentPartnerEmail: "",
    rules: {
      email: v => !!(v || "").match(/@/) || "Please enter a valid email."
    }
  }),
  methods: {
    async searchPartner() {
      this.isLoading = true;
      this.message = "";
      this.foundUser = null;

      const snapshot = await db
        .collection("users")
        .where("email", "==", this.email.toLowerCase())
        .get();
      if (!snapshot.empty) {
        const userId = snapshot.docs[0].id;
        const userData = snapshot.docs[0].data();
        this.foundUser = {
          id: userId,
          ...userData
        };
      } else {
        this.message = "No user found!";
      }
      this.isLoading = false;
    },

    async getPartnerData() {
      const self = this;
      const authUserId = this.$store.state.user.id;
      const ref = db.collection("users").doc(authUserId);
      var getOptions = {
        source: "server"
      };
      ref
        .get(getOptions)
        .then(async function(doc) {
          var partnerId = doc.data().partnerId;
          const snapshot = await db
            .collection("users")
            .doc(partnerId)
            .get();
          self.currentPartnerName = snapshot.data().name;
          self.currentPartnerEmail = snapshot.data().email;
        })
        .catch(function(error) {
          console.log("Error getting cached document:", error);
        });
    },

    async addPartner(id) {
      try {
        const authUserId = this.$store.state.user.id;
        if (id == authUserId) {
          this.toastColor = "red";
          this.toastMessage = "You can't add yourself as a partner.";
          this.showToast = true;
        } else {
          await db
            .collection("users")
            .doc(authUserId)
            .update({ partnerId: id });
          this.$store.dispatch("user/setPartnerId", id);
          this.toastColor = "success";
          this.toastMessage = "Partner added!";
          this.showToast = true;
        }
      } catch (error) {
        this.toastColor = "red";
        this.toastMessage = "Error when adding partner. Please try again.";
        this.showToast = true;
      }
    }
  }
};
</script>
