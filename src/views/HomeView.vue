<template>
  <div id="homeView">
    <!-- 对战功能区域 -->
    <div class="match-section">
      <a-card class="match-card">
        <div class="match-content">
          <div class="match-info">
            <h2 class="match-title">🔥 1v1 在线对战</h2>
            <p class="match-description">
              与其他程序员实时对战，比拼算法能力！获得胜利的快感！
            </p>
          </div>
          <div class="match-actions">
            <a-button
              type="primary"
              size="large"
              @click="startMatch"
              :loading="isMatching"
              class="match-button"
            >
              <template #icon>
                <icon-fire />
              </template>
              {{ isMatching ? "匹配中..." : "开始对战" }}
            </a-button>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 题目搜索区域 -->
    <a-form :model="searchParams" layout="inline" style="margin-bottom: 30px">
      <a-form-item field="title" label="标题">
        <a-input
          v-model="searchParams.title"
          placeholder="请输入标题"
          style="min-width: 240px"
        />
      </a-form-item>
      <a-form-item field="tags" label="标签">
        <a-input-tag
          v-model="searchParams.tags"
          placeholder="请输入标签"
          style="min-width: 240px"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="doSubmit">搜索</a-button>
      </a-form-item>
    </a-form>
    <a-table
      :columns="columns"
      :data="dataList"
      :pagination="{
        pageSize: searchParams.pageSize,
        current: searchParams.current,
        total: total,
        showTotal: true,
      }"
      @pageChange="onPageChange"
      column-resizable
      :bordered="{ cell: true }"
    >
      <template #optional="{ record }">
        <a-space>
          <a-button type="primary" @click="toQuestionPage(record)"
            >做题
          </a-button>
        </a-space>
      </template>
      <template #tags="{ record }">
        <div>
          <a-space wrap>
            <a-tag
              v-for="(tag, index) of record.tags"
              :key="index"
              color="green"
              >{{ tag }}
            </a-tag>
          </a-space>
        </div>
      </template>
      <template #acceptRate="{ record }">
        <div>
          {{
            `${
              record.submitNum
                ? Math.ceil((record.acceptedNum / record.submitNum) * 100)
                : 0
            }% (${record.acceptedNum}/${record.submitNum})`
          }}
        </div>
      </template>
      <template #createTime="{ record }">
        <div>
          {{ moment(record.createTime).format("YYYY-MM-DD") }}
        </div>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import {
  Question,
  QuestionControllerService,
  QuestionQueryRequest,
} from "../../generated/question";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
import { IconFire } from "@arco-design/web-vue/es/icon";
import moment from "moment";
import { useMatch } from "@/composables/useMatch";

const router = useRouter();
const { isMatching, startMatching } = useMatch();

const dataList = ref([]);
const total = ref(0);

const searchParams = ref<QuestionQueryRequest>({
  tags: [],
  title: "",
  pageSize: 10,
  current: 1,
});

// 开始对战
const startMatch = async () => {
  try {
    await startMatching();
    router.push("/match/waiting");
  } catch (error) {
    console.error("开始匹配失败:", error);
  }
};

const loadData = async () => {
  const res = await QuestionControllerService.listQuestionVoByPageUsingPost(
    searchParams.value
  );
  if (res.code == 0) {
    dataList.value = res.data.records;
    total.value = res.data.total;
  } else {
    message.error("获取题目列表失败，" + res.message);
  }
};

watchEffect(() => {
  loadData();
});

onMounted(() => {
  loadData();
});

const onPageChange = (page: number) => {
  searchParams.value = {
    ...searchParams.value,
    current: page,
  };
};

const doSubmit = () => {
  searchParams.value = {
    ...searchParams.value,
    current: 1,
  };
  // loadData();
};

const toQuestionPage = (question: Question) => {
  router.push({
    path: `/view/question/${question.id}`,
  });
};

const columns = [
  {
    title: "题目编号",
    dataIndex: "id",
  },
  {
    title: "标题",
    dataIndex: "title",
    ellipsis: true,
  },
  {
    title: "标签",
    dataIndex: "tags",
    slotName: "tags",
  },
  {
    title: "通过率",
    slotName: "acceptRate",
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    slotName: "createTime",
    width: 145,
  },
  {
    title: "Optional",
    slotName: "optional",
    width: 155,
  },
];
</script>

<style scoped>
#homeView {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

/* 对战功能区域样式 */
.match-section {
  margin-bottom: 32px;
}

.match-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.match-card :deep(.arco-card-body) {
  padding: 0;
}

.match-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px;
  color: white;
}

.match-info {
  flex: 1;
}

.match-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 12px;
  color: white;
}

.match-description {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  line-height: 1.6;
}

.match-actions {
  flex-shrink: 0;
  margin-left: 32px;
}

.match-button {
  font-size: 16px;
  height: 48px;
  padding: 0 32px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.match-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.match-button:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .match-content {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }

  .match-actions {
    margin-left: 0;
    margin-top: 20px;
  }

  .match-title {
    font-size: 24px;
  }

  .match-description {
    font-size: 14px;
  }
}
</style>
