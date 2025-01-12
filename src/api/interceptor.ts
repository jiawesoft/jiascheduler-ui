import { useUserStore } from '@/store';
import { getTeamId, getToken } from '@/utils/auth';
import { Message, Modal } from '@arco-design/web-vue';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

export interface HttpResponse<T = unknown> {
  // status: number;
  msg: string;
  code: number;
  data: T;
}

if (import.meta.env.VITE_API_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
}

axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // let each request carry token
    // this example using the JWT token
    // Authorization is a custom headers key
    // please modify it according to the actual situation
    const token = getToken();
    if (token) {
      if (!config.headers) {
        // config.headers = {};
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    const teamId = getTeamId();
    if (teamId) {
      config.headers.set('X-Team-Id', teamId);
    }
    return config;
  },
  (error) => {
    // do something
    return Promise.reject(error);
  }
);
// add response interceptors
axios.interceptors.response.use(
  (
    response: AxiosResponse<HttpResponse, any>
  ): AxiosResponse<any, any> | Promise<AxiosResponse<any, any>> => {
    const res = response.data;
    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 20000) {
      if (
        [50401].includes(res.code) &&
        !['/api/user/info', '/api/migration/version/check'].includes(
          response.config.url as string
        )
      ) {
        Modal.error({
          title: 'Confirm logout',
          content:
            'You have been logged out, you can cancel to stay on this page, or log in again',
          okText: 'Re-Login',
          async onOk() {
            const userStore = useUserStore();
            await userStore.logout();
            window.location.reload();
          },
        });
      } else {
        Message.error({
          content: res.msg || 'Error',
          duration: 5 * 1000,
        });
      }
      return Promise.reject(new Error(res.msg || 'Error'));
    }
    const ret = {
      ...response,
      data: res.data,
    };

    return ret;
  },
  (error) => {
    Message.error({
      content: error.msg || `${error}`,
      duration: 5 * 1000,
    });
    return Promise.reject(error);
  }
);
