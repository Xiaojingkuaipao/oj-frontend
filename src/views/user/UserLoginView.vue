<template>
  <div id="userLoginView">
    <h2>用户登陆</h2>
    <a-form
      :model="form"
      @submit="handleSubmit"
      label-align="left"
      auto-label-width
      style="max-width: 480px; margin: 40px auto"
    >
      <a-form-item field="userAccount" label="账号">
        <a-input v-model="form.userAccount" placeholder="请输入账号" />
      </a-form-item>
      <a-form-item field="userPassword" label="密码" tooltip="密码不小于8位">
        <a-input-password
          v-model="form.userPassword"
          placeholder="请输入密码"
        />
      </a-form-item>
      <a-form-item>
        <a-button
          html-type="submit"
          type="primary"
          style="width: 300px; margin: 20px auto"
          >登陆
        </a-button>
      </a-form-item>
      <div>没有账号？<a-link @click="goToRegister">立即注册</a-link></div>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import {
  UserControllerService,
  UserLoginRequest,
} from "../../../generated/user";
import message from "@arco-design/web-vue/es/message";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

const form: UserLoginRequest = reactive({
  userAccount: "",
  userPassword: "",
});

const store = useStore();
const router = useRouter();

const goToRegister = () => {
  router.push("/user/register");
};

const handleSubmit = async () => {
  const res = await UserControllerService.userLoginUsingPost(form);
  if (res.code === 0) {
    // 直接使用登录响应的用户数据更新store
    store.commit("user/updateUser", res.data);
    message.success("登陆成功");
    router.push({
      path: "/",
      replace: true,
    });
  } else {
    message.error("登陆失败, " + res.message);
    console.log(res.message);
  }
};
</script>

<style scoped>
#userLayout {
  margin: 0 auto;
}
</style>
