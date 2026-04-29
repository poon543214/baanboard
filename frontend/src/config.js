const baseApiUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:3000" : "https://baanboard-api.onrender.com");

const Configs = {
  version: "V.2.0.0",
  api: {
    baseApiUrl: baseApiUrl,
    auth: {
      login: "/login",
      register: "/register",
      forgotPassword: "/forgot-password",
      resetPassword: "/reset-password",
    },
    get: {
      post: "/post",
      profile: "/profile",
      likedpost: "/likedpost",
      commentedpost: "/commentedpost"
    },
    post: {
      newPost: "/post",
      like: "/post/",
      comment: "/post/"
    },
    put: {
      updateProfile: "/profile",
      updatePost: "/post/"
    },
    del: {
      delete: "/deletepost/"
    }
  },

  storage: {
    token: "access_token",
    user: "user_data",
  },
};

export default Configs;
