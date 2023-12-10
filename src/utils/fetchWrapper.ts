/* eslint-disable @typescript-eslint/no-explicit-any */
import { LOGOFF_PATH } from "../routes/path";
import { tokenIsExpired } from "./tokenIsExpired";

const fetchWrapper = async (url: string, options?: any) => {
    if(options?.headers?.Authorization && !tokenIsExpired(options?.headers?.Authorization)) {
      window.location.href = LOGOFF_PATH;
    }
    const response = await fetch(url, options);
    return response;
  }
  
export default fetchWrapper;
  