import { googleAuthUrl } from "../urls";

const googleAuth = () => {
  window.location.href = googleAuthUrl;
};

export default googleAuth;
