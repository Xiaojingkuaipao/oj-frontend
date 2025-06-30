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
      <a-col flex="auto" style="text-align: right; margin-right: 20px">
        <!-- 在线匹配按钮 -->
        <a-button
          v-if="isLoggedIn"
          type="primary"
          shape="round"
          @click="startMatching"
          style="margin-right: 16px"
        >
          <template #icon>
            <icon-thunderbolt />
          </template>
          在线匹配
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
  IconThunderbolt,
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

// 开始匹配对战 - 静态演示版本
const startMatching = () => {
  // 创建匹配弹窗
  const matchingModal = document.createElement("div");
  matchingModal.id = "matching-modal";
  matchingModal.innerHTML = `
    <div style="
      position: fixed; 
      top: 0; 
      left: 0; 
      width: 100%; 
      height: 100%; 
      background: rgba(0,0,0,0.6); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      z-index: 1000;
      backdrop-filter: blur(4px);
    ">
      <div style="
        background: white; 
        padding: 48px; 
        border-radius: 12px; 
        text-align: center; 
        max-width: 480px;
        box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        position: relative;
      ">
        <div style="font-size: 24px; margin-bottom: 24px; font-weight: 600; color: #1f2937;">正在匹配对手...</div>
        <div id="wait-time" style="font-size: 18px; color: #3b82f6; margin-bottom: 32px; font-weight: 500;">已等待: 00:00</div>
        <div style="margin-bottom: 32px;">
          <div style="
            width: 60px; 
            height: 60px; 
            border: 4px solid #e5e7eb; 
            border-top: 4px solid #3b82f6; 
            border-radius: 50%; 
            animation: spin 1s linear infinite; 
            margin: 0 auto;
          "></div>
        </div>
        <div style="color: #6b7280; margin-bottom: 24px; font-size: 14px;">
          请耐心等待，我们正在为您寻找合适的对手
        </div>
        <button id="cancel-btn" style="
          background: #ef4444; 
          color: white; 
          border: none; 
          padding: 12px 24px; 
          border-radius: 8px; 
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        " 
        onmouseover="this.style.background='#dc2626'" 
        onmouseout="this.style.background='#ef4444'">
          取消匹配
        </button>
      </div>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;

  document.body.appendChild(matchingModal);

  let waitTime = 0;
  const waitTimer = setInterval(() => {
    waitTime++;
    const mins = Math.floor(waitTime / 60);
    const secs = waitTime % 60;
    const timeElement = document.getElementById("wait-time");
    if (timeElement) {
      timeElement.textContent = `已等待: ${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }

    // 2秒后匹配成功
    if (waitTime >= 2) {
      clearInterval(waitTimer);
      showMatchSuccess(matchingModal);
    }
  }, 1000);

  // 取消匹配功能
  const cancelBtn = matchingModal.querySelector("#cancel-btn");
  cancelBtn?.addEventListener("click", () => {
    clearInterval(waitTimer);
    document.body.removeChild(matchingModal);
    message.info("已取消匹配");
  });

  // 匹配成功显示
  const showMatchSuccess = (modal: HTMLElement) => {
    modal.innerHTML = `
      <div style="
        position: fixed; 
        top: 0; 
        left: 0; 
        width: 100%; 
        height: 100%; 
        background: rgba(0,0,0,0.6); 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        z-index: 1000;
        backdrop-filter: blur(4px);
      ">
        <div style="
          background: white; 
          padding: 48px; 
          border-radius: 12px; 
          text-align: center; 
          max-width: 480px;
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        ">
          <div style="
            width: 80px; 
            height: 80px; 
            background: #10b981; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            margin: 0 auto 24px auto;
          ">
            <div style="font-size: 48px; color: white;">✓</div>
          </div>
          <div style="font-size: 24px; color: #10b981; margin-bottom: 24px; font-weight: 600;">匹配成功！</div>
          <div style="
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 24px;
            border: 1px solid #e2e8f0;
          ">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
              <div style="
                width: 48px; 
                height: 48px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                color: white; 
                font-weight: bold; 
                margin-right: 16px;
              ">AI</div>
              <div style="text-align: left;">
                <div style="font-size: 18px; font-weight: 600; color: #1f2937;">智能对手</div>
                <div style="color: #6b7280; font-size: 14px;">等级：Gold | 胜率：85%</div>
              </div>
            </div>
          </div>
          <div id="countdown" style="font-size: 48px; color: #3b82f6; margin-bottom: 12px; font-weight: bold;">3</div>
          <div style="color: #6b7280; font-size: 16px;">秒后开始对战</div>
        </div>
      </div>
    `;

    let countdown = 3;
    const countdownTimer = setInterval(() => {
      countdown--;
      const countdownElement = document.getElementById("countdown");
      if (countdownElement) {
        countdownElement.textContent = countdown.toString();
      }

      if (countdown <= 0) {
        clearInterval(countdownTimer);
        document.body.removeChild(modal);
        // 跳转到静态对战房间演示
        router.push("/battle/room/demo123");
        message.success("进入对战房间！");
      }
    }, 1000);
  };
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
