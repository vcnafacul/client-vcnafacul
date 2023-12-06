/* eslint-disable @typescript-eslint/no-explicit-any */
import { LOGOFF_PATH } from "../routes/path";

const fetchWrapper = async (url: string, options?: any) => {
    const response = await fetch(url, options);
      if (response.status === 401) {
        window.location.href = LOGOFF_PATH;
      }
      return response;
  }
  
export default fetchWrapper;
  