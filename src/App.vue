<template>
  <div id="app">
    <template v-if="route.path.startsWith('/user')">
      <router-view />
    </template>
    <template v-else>
      <BasicLayout />
    </template>
  </div>
</template>

<style>
/* 全局样式 */
</style>
<script setup lang="ts">
import BasicLayout from "@/layouts/BasicLayout.vue";
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

const route = useRoute();
const store = useStore();

/**
 *全局初始化函数，有全局单次调用的代码，都可以写到这里
 */
const doInit = async () => {
  console.log("OJ判题，Create By ZunF@2023");
  // 获取当前登录用户信息
  try {
    await store.dispatch("user/getLoginUser");
    console.log("用户登录状态已初始化");
  } catch (error) {
    console.error("获取用户登录状态失败:", error);
  }
};

onMounted(() => {
  doInit();
});
</script>
