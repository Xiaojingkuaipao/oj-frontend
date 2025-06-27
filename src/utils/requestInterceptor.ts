import axios from "axios";

// 设置axios默认配置
axios.defaults.withCredentials = true;
axios.defaults.timeout = 10000;

// 全局请求拦截器
axios.interceptors.request.use(
  function (config) {
    // 确保每个请求都携带凭证
    config.withCredentials = true;
    // 确保Content-Type正确设置
    if (config.data && typeof config.data === "object") {
      config.headers = config.headers || {};
      if (!config.headers["Content-Type"]) {
        config.headers["Content-Type"] = "application/json";
      }
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// 响应拦截器
axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    console.error("请求错误:", error);
    return Promise.reject(error);
  }
);
