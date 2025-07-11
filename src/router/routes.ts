import { RouteRecordRaw } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import NoAuthView from "@/views/NoAuthView.vue";
import UserLoginView from "@/views/user/UserLoginView.vue";
import AddQuestionView from "@/views/question/AddQuestionView.vue";
import ViewQuestionView from "@/views/question/ViewQuestionView.vue";
import UserRegisterView from "@/views/user/UserRegisterView.vue";
import UserInfoView from "@/views/user/UserInfoView.vue";
import ManageQuestionView from "@/views/question/ManageQuestionView.vue";
import QuestionSubmitView from "@/views/question/QuestionSubmitView.vue";
import ListOpenApiView from "@/views/interface/ListOpenApiView.vue";
import ApiDocumentView from "@/views/interface/ApiDocumentView.vue";
import AddInterfaceView from "@/views/interface/AddInterfaceView.vue";
import AccessEnum from "@/access/accessEnum";
import UserLayout from "../layouts/UserLayout.vue";
import InterView from "@/views/interview/InterView.vue";
import MatchWaitingView from "@/views/match/MatchWaitingView.vue";
import MatchResultView from "@/views/match/MatchResultView.vue";
import BattleView from "@/views/match/BattleView.vue";

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/match/waiting",
    name: "匹配等待",
    component: MatchWaitingView,
    meta: {
      access: AccessEnum.USER,
      hideInMenu: true,
    },
  },
  {
    path: "/match/result",
    name: "匹配结果",
    component: MatchResultView,
    meta: {
      access: AccessEnum.USER,
      hideInMenu: true,
    },
  },
  {
    path: "/match/battle/:id?",
    name: "对战页面",
    component: BattleView,
    meta: {
      access: AccessEnum.USER,
      hideInMenu: true,
    },
  },
  {
    path: "/user",
    name: "用户相关",
    component: UserLayout,
    meta: {
      hideInMenu: true,
    },
    children: [
      {
        path: "login",
        name: "登陆",
        component: UserLoginView,
      },
      {
        path: "register",
        name: "注册",
        component: UserRegisterView,
      },
    ],
  },
  {
    path: "/",
    name: "首页",
    component: HomeView,
  },
  {
    path: "/question_submit",
    name: "浏览提交",
    component: QuestionSubmitView,
  },
  {
    path: "/AIChat",
    name: "模拟面试",
    component: InterView,
  },
  {
    path: "/view/question/:id",
    name: "做题页面",
    component: ViewQuestionView,
    props: true,
    meta: {
      access: AccessEnum.USER,
      hideInMenu: true,
    },
  },
  {
    path: "/add/question",
    name: "创建题目",
    component: AddQuestionView,
    meta: {
      access: AccessEnum.ADMIN,
    },
  },
  {
    path: "/update/question",
    name: "更新题目",
    component: AddQuestionView,
    meta: {
      access: AccessEnum.ADMIN,
      hideInMenu: true,
    },
  },
  {
    path: "/manage/question",
    name: "管理题目",
    component: ManageQuestionView,
    meta: {
      access: AccessEnum.ADMIN,
    },
  },
  {
    path: "/list/api",
    name: "开放接口列表",
    component: ListOpenApiView,
    meta: {
      hideInMenu: true,
      access: AccessEnum.USER,
    },
  },
  {
    path: "/info/user/:id",
    name: "用户信息",
    props: true,
    component: UserInfoView,
    meta: {
      hideInMenu: true,
      access: AccessEnum.USER,
    },
  },
  {
    path: "/interface/document/:id",
    name: "接口文档",
    props: true,
    component: ApiDocumentView,
    meta: {
      hideInMenu: true,
    },
  },
  {
    path: "/add/interface",
    name: "添加接口",
    component: AddInterfaceView,
    meta: {
      access: AccessEnum.ADMIN,
    },
  },
  {
    path: "/update/interface",
    name: "更新接口",
    component: AddInterfaceView,
    meta: {
      access: AccessEnum.ADMIN,
      hideInMenu: true,
    },
  },
  {
    path: "/404",
    name: "权限不足",
    component: NoAuthView,
    meta: {
      hideInMenu: true,
    },
  },
];
