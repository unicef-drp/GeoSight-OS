import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const cache = new Map<string, any>();

const axiosRequest = axios.create();

// @ts-ignore
axiosRequest.interceptors.request.use((config: AxiosRequestConfig) => {
  const cachedResponse = cache.get(config.url!);

  if (cachedResponse) {
    return Promise.reject({ cached: true, data: cachedResponse });
  }

  return config;
});

axiosRequest.interceptors.response.use(
  (response: AxiosResponse): any => {
    cache.set(response.config.url!, response);
    return response;
  },
  (error: any) => {
    if (error.cached) {
      return Promise.resolve(error.data);
    }
    return Promise.reject(error);
  }
);

export default axiosRequest;
