<template>
  <div id="userRegisterView">
    <h2>用户注册</h2>
    <a-form
      :model="form"
      @submit="handleSubmit"
      label-align="left"
      auto-label-width
      style="max-width: 480px; margin: 40px auto"
      :rules="rules"
    >
      <a-form-item field="userAccount" label="账号">
        <a-input
          v-model="form.userAccount"
          placeholder="请输入账号（支持账号/邮箱）"
          allow-clear
        />
      </a-form-item>

      <a-form-item field="userName" label="用户名">
        <a-input
          v-model="form.userName"
          placeholder="请输入用户名"
          allow-clear
        />
      </a-form-item>

      <a-form-item
        field="userPassword"
        label="密码"
        tooltip="密码不小于8位，需包含字母和数字"
      >
        <a-input-password
          v-model="form.userPassword"
          placeholder="请输入密码"
          allow-clear
        />
      </a-form-item>

      <a-form-item
        field="confirmPassword"
        label="确认密码"
        tooltip="请再次输入密码进行确认"
      >
        <a-input-password
          v-model="form.confirmPassword"
          placeholder="请再次输入密码"
          allow-clear
        />
      </a-form-item>

      <a-form-item>
        <div class="form-actions">
          <a-button
            html-type="submit"
            type="primary"
            style="width: 300px; margin: 20px auto"
            :loading="loading"
          >
            注册
          </a-button>
        </div>
      </a-form-item>
      <a-form-item>
        <div class="login-link">
          已有账号？
          <a-link @click="goToLogin">立即登录</a-link>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { Message } from "@arco-design/web-vue";
import { useRouter } from "vue-router";

// 表单数据
const form = reactive({
  userAccount: "",
  userName: "",
  userPassword: "",
  confirmPassword: "",
});

// 加载状态
const loading = ref(false);
const router = useRouter();

// 表单验证规则
const rules = {
  userAccount: [
    { required: true, message: "账号不能为空" },
    {
      validator: (value: string) => {
        if (!value) return false;
        // 简单的邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const accountRegex = /^[a-zA-Z0-9_]{4,20}$/;
        return emailRegex.test(value) || accountRegex.test(value);
      },
      message: "请输入有效的账号或邮箱地址",
    },
  ],
  userName: [
    { required: true, message: "用户名不能为空" },
    {
      minLength: 2,
      maxLength: 20,
      message: "用户名长度应在2-20个字符之间",
    },
  ],
  userPassword: [
    { required: true, message: "密码不能为空" },
    {
      minLength: 8,
      message: "密码长度不能少于8位",
    },
    {
      validator: (value: string) => {
        if (!value) return false;
        // 密码强度校验：包含字母和数字
        return /[a-zA-Z]/.test(value) && /[0-9]/.test(value);
      },
      message: "密码必须包含字母和数字",
    },
  ],
  confirmPassword: [
    { required: true, message: "请确认密码" },
    {
      validator: (value: string) => {
        return value === form.userPassword;
      },
      message: "两次输入的密码不一致",
    },
  ],
};

// 提交处理
const handleSubmit = async () => {
  try {
    loading.value = true;
    // 基础验证
    if (!form.userAccount) {
      Message.error("请输入账号");
      return;
    }

    if (!form.userName) {
      Message.error("请输入用户名");
      return;
    }

    if (!form.userPassword) {
      Message.error("请输入密码");
      return;
    }
    if (!form.confirmPassword) {
      Message.error("请确认密码");
      return;
    }

    // 密码一致性验证
    if (form.userPassword !== form.confirmPassword) {
      Message.error("两次输入的密码不一致");
      return;
    }

    // 密码强度验证
    if (form.userPassword.length < 8) {
      Message.error("密码长度不能少于8位");
      return;
    }

    if (
      !/[a-zA-Z]/.test(form.userPassword) ||
      !/[0-9]/.test(form.userPassword)
    ) {
      Message.error("密码必须包含字母和数字");
      return;
    }

    // 模拟注册请求（静态页面）
    await new Promise((resolve) => setTimeout(resolve, 1000));

    Message.success("注册成功！请登录");

    // 清空表单
    Object.assign(form, {
      userAccount: "",
      userName: "",
      userPassword: "",
      confirmPassword: "",
    });

    // 跳转到登录页面
    router.push("/user/login");
  } catch (error) {
    console.error("注册失败:", error);
    Message.error("注册失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

// 跳转到登录页面
const goToLogin = () => {
  router.push("/user/login");
};
</script>

<style scoped>
#userRegisterView {
  margin: 0 auto;
  padding: 20px;
}

#userRegisterView h2 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.form-actions {
  display: flex;
  justify-content: center;
  width: 100%;
}

.login-link {
  text-align: center;
  margin-top: 16px;
  color: #86909c;
  font-size: 14px;
}

.login-link a {
  color: #165dff;
  text-decoration: none;
  margin-left: 4px;
}

.login-link a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  #userRegisterView {
    padding: 10px;
  }

  .a-form {
    max-width: 100% !important;
    margin: 20px auto !important;
  }

  .a-button {
    width: 100% !important;
  }
}
</style>
