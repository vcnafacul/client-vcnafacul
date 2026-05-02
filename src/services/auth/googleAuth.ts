import { authGoogle } from "../urls";

const googleAuth = () => {
  console.log("googleAuth called, redirecting to:", authGoogle);
  window.location.href = authGoogle;
};

export default googleAuth;
