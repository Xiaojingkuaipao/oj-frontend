<template>
  <div id="globalHeader">
    <a-row align="center" :wrap="false">
      <a-col flex="auto">
        <a-menu
          mode="horizontal"
          :selected-keys="selectKeys"
          @menu-item-click="doMenuClick"
        >
          <a-menu-item
            key="0"
            :style="{ padding: 0, marginRight: '38px' }"
            disabled
          >
            <div
              :style="{
                width: '50px',
                height: '50px',
                borderRadius: '2px',
                background: 'var(--color-fill-3)',
                cursor: 'text',
              }"
            >
              <img
                style="height: 100%; width: 100%"
                src="../assets/CquLogo.svg"
              />
            </div>
          </a-menu-item>
          <a-menu-item v-for="item in visibleRoutes" :key="item.path">
            {{ item.name }}
          </a-menu-item>
        </a-menu>
      </a-col>
      <a-col flex="110px">
        <a-button
          type="primary"
          status="blue"
          @click="handleStartMatch"
          :loading="matchStatus === 'matching'"
          style="margin-right: 20px"
        >
          1v1对战
        </a-button>
      </a-col>
      <a-col flex="150px">
        <a-dropdown-button>
          {{ displayUserName }}
          <template #icon>
            <icon-down />
          </template>
          <template #content>
            <a-doption style="padding: 0 15px">
              <div v-if="isLoggedIn" @click="handleLogout">
                <icon-import />
                退出登陆
              </div>
              <div v-else @click="handleLogin">
                <icon-export />
                立即登陆
              </div>
            </a-doption>
            <a-doption style="padding: 0 15px">
              <div @click="goApiList">
                <icon-send />
                Api开放平台
              </div>
            </a-doption>
            <a-doption style="padding: 0 15px">
              <div @click="goUserInfo">
                <icon-user />
                个人信息
              </div>
            </a-doption>
          </template>
        </a-dropdown-button>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import {
  IconDown,
  IconExport,
  IconImport,
  IconSend,
  IconUser,
} from "@arco-design/web-vue/es/icon";
import { routes } from "@/router/routes";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import checkAccess from "@/access/checkAccess";
import "@/access";
import message from "@arco-design/web-vue/es/message";

const router = useRouter();
const selectKeys = ref(["/"]);
const store = useStore();

// 计算用户是否已登录
const isLoggedIn = computed(() => {
  const userRole = store.state.user?.loginUser?.userRole;
  return userRole && userRole !== "notLogin";
});

// 计算显示的用户名
const displayUserName = computed(() => {
  return isLoggedIn.value ? store.state.user?.loginUser?.userName : "未登录";
});

// 匹配状态
const matchStatus = computed(() => store.state.match?.matchStatus);

// 处理开始匹配
const handleStartMatch = () => {
  // 检查用户是否已登录
  if (!isLoggedIn.value) {
    message.error("请先登录再进行匹配");
    router.push("/user/login");
    return;
  }
  // 跳转到匹配等待页面
  router.push("/match/waiting");
};

//展示在菜单的路由
const visibleRoutes = computed(() => {
  return routes.filter((item) => {
    if (item.meta?.hideInMenu) {
      return false;
    }
    if (!checkAccess(store.state.user.loginUser, item.meta?.access as string)) {
      return false;
    }
    return true;
  });
});

router.afterEach((to) => {
  selectKeys.value = [to.path];
});
const doMenuClick = (key: string) => {
  router.push({
    path: key,
  });
};

// setTimeout(() => {
//   store.dispatch("user/getLoginUser");
// }, 3000);

const handleLogin = () => {
  router.push("/user/login");
};

const goApiList = () => {
  router.push("/list/api");
};
const goUserInfo = () => {
  router.push({
    path: `/info/user/${store.state.user.loginUser.id}`,
  });
};

const handleLogout = async () => {
  try {
    console.log("GlobalHeader: 开始登出...");

    // 添加API连通性测试
    console.log("测试API连通性...");
    try {
      await store.dispatch("user/getLoginUser");
      console.log("API连通性正常");
    } catch (testError) {
      console.error("API连通性测试失败:", testError);
      message.error("无法连接到服务器，请检查网络连接");
      return;
    }

    const result = await store.dispatch("user/logout");
    console.log("GlobalHeader: 登出结果", result);

    if (result.success) {
      message.success("退出登陆成功");
      router.push("/user/login");
    } else {
      message.error("退出登陆失败，" + (result.message || "未知错误"));
    }
  } catch (error) {
    console.error("GlobalHeader: 登出异常", error);
    message.error("退出登陆失败，系统异常");
  }
};
</script>

<style scoped></style>
