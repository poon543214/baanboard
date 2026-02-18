const baseApiUrl = "https://baanboard.onrender.com";

const Configs = {
  version: "V.1.0.0",
  api: {
    baseApiUrl: baseApiUrl,
    auth: {
        login: "/login",
    },
    get: {
        post: "/getpost"  ,
        mypost: "/mypost"
    },
    post: {
        create: "/createpost",
        update: "/updatepost",
        delete: "/deletepost"
    }
  },

  storage: {
    token: "access_token",
    user: "user_data",
  },
};

export default Configs;