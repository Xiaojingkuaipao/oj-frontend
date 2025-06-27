// initial state
import { StoreOptions } from "vuex";
import AccessEnum from "@/access/accessEnum";
import { UserControllerService } from "../../generated/user";

export default {
  namespaced: true,
  state: () => ({
    loginUser: {
      userName: "未登录",
      userRole: AccessEnum.NOT_LOGIN,
      //初始设为NOT_LOGIN状态，登录成功后userRole会更新为具体权限
    },
  }),
  actions: {
    async getLoginUser({ commit, state }) {
      //从远程获取登陆信息
      const res = await UserControllerService.getLoginUserUsingGet();
      if (res.code === 0) {
        commit("updateUser", res.data);
      } else {
        commit("updateUser", {
          ...state.loginUser,
          userRole: AccessEnum.NOT_LOGIN,
        });
      }
    },
    // 添加登出action
    async logout({ commit }) {
      try {
        console.log("开始调用logout API...");
        const data = await UserControllerService.userLogoutUsingPost();
        console.log("logout API响应:", data);

        if (data.code === 0) {
          commit("updateUser", {
            userName: "未登录",
            userRole: AccessEnum.NOT_LOGIN,
          });
          return { success: true };
        } else {
          console.error("logout API返回错误:", data.message);
          return { success: false, message: data.message };
        }
      } catch (error: any) {
        console.error("logout API调用异常:", error);
        return {
          success: false,
          message: `退出登录失败: ${error.message || error}`,
        };
      }
    },
  },
  mutations: {
    updateUser(state, user) {
      state.loginUser = user;
    },
  },
} as StoreOptions<any>;
