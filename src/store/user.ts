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
        const data = await UserControllerService.userLogoutUsingPost();
        if (data.code === 0) {
          commit("updateUser", {
            userName: "未登录",
            userRole: AccessEnum.NOT_LOGIN,
          });
          return { success: true };
        } else {
          return { success: false, message: data.message };
        }
      } catch (error) {
        return { success: false, message: "退出登录失败" };
      }
    },
  },
  mutations: {
    updateUser(state, user) {
      state.loginUser = user;
    },
  },
} as StoreOptions<any>;
