<template>
  <div id="viewQuestionView">
    <!-- 对战模式顶部指示器 -->
    <div v-if="isBattleMode" class="battle-indicator">
      <div class="battle-status">
        <a-badge status="processing" />
        <span class="battle-text">对战模式</span>
      </div>
      <div class="battle-opponent">
        <span class="vs-text">VS</span>
        <a-avatar size="small" style="margin-right: 8px">
          {{ opponent?.userName?.charAt(0) }}
        </a-avatar>
        <span class="opponent-name">{{ opponent?.userName }}</span>
      </div>
    </div>
    <a-row :gutter="[24, 24]">
      <a-col :md="8" :xs="24">
        <a-tabs default-active-key="1">
          <a-tab-pane key="1" title="题目描述">
            <a-card
              :style="{
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                minHeight: '75vh',
              }"
              v-if="question"
              :title="question.title"
              :header-style="{
                backgroundColor: '#fafafa',
                borderRadius: '10px 10px 0 0',
              }"
            >
              <a-descriptions
                title="判题条件"
                :column="{ xs: 1, md: 1, lg: 3 }"
              >
                <a-descriptions-item label="时间限制">
                  {{ question.judgeConfig?.timeLimit ?? 0 }}
                </a-descriptions-item>
                <a-descriptions-item label="内存限制">
                  {{ question.judgeConfig?.memoryLimit ?? 0 }}
                </a-descriptions-item>
                <a-descriptions-item label="堆栈限制">
                  {{ question.judgeConfig?.stackLimit ?? 0 }}
                </a-descriptions-item>
              </a-descriptions>
              <MdViewer :value="question?.content" />
              <template #extra>
                <a-space wrap>
                  <a-tag
                    v-for="(tag, index) of question.tags"
                    :key="index"
                    color="green"
                    >{{ tag }}
                  </a-tag>
                </a-space>
              </template>
            </a-card>
          </a-tab-pane>
          <a-tab-pane key="2" title="评论">
            <div class="comment-section">
              <!-- 发表评论 -->
              <div class="comment-form">
                <a-textarea
                  v-model="newComment"
                  placeholder="写下你的评论..."
                  :max-length="1000"
                  :rows="4"
                  show-word-limit
                />
                <div class="comment-form-actions">
                  <a-button
                    type="primary"
                    @click="submitComment"
                    :disabled="!newComment.trim()"
                  >
                    发表评论
                  </a-button>
                </div>
              </div>

              <!-- 评论列表 -->
              <div class="comment-list">
                <div v-if="comments.length === 0" class="no-comments">
                  <a-empty description="暂无评论，快来发表第一条评论吧！" />
                </div>
                <comment-item
                  v-for="comment in sortedComments"
                  :key="comment.id"
                  :comment="comment"
                  :current-user="currentUser"
                  @like="handleLike"
                  @reply="handleReply"
                  @reply-like="handleReplyLike"
                />
              </div>
            </div>
          </a-tab-pane>
          <a-tab-pane key="3" title="题解">
            <!-- <MdViewer v-if="question" :value="question.answer" /> -->
            <MdViewer v-if="question" :value="question.answer" />
          </a-tab-pane>
        </a-tabs>
      </a-col>
      <a-col :md="16" :xs="24">
        <a-card
          :style="{
            borderRadius: '10px',
            height: '81vh',
          }"
        >
          <code-editor
            :value="form.code"
            :handle-change="onEditChange"
            :language="form.language"
          />
          <template #title>
            <a-select
              :style="{ width: '110px', backgroundColor: '#ffffff' }"
              v-model="form.language"
              placeholder="选择语言"
              allow-clear
              @change="onLanguageChange"
            >
              <a-option>java</a-option>
              <a-option>cpp</a-option>
              <a-option>go</a-option>
            </a-select>
          </template>
          <template #extra>
            <a-button type="outline" status="success" @click="doSubmit">
              <IconPlayArrow />
              提交代码
            </a-button>
          </template>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import {
  QuestionControllerService,
  QuestionSubmitAddRequest,
  QuestionVO,
} from "../../../generated/question";
import message from "@arco-design/web-vue/es/message";
import { ref, defineProps, withDefaults, onMounted, computed } from "vue";
import CodeEditor from "@/components/CodeEditor.vue";
import MdViewer from "@/components/MdViewer.vue";
import CommentItem from "@/components/CommentItem.vue";
import { IconPlayArrow } from "@arco-design/web-vue/es/icon";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

interface Props {
  id: string;
}

const route = useRoute();
const router = useRouter();
const store = useStore();

// 检查是否是匹配模式
const isBattleMode = computed(() => {
  return route.query.matchMode === "true";
});

// 获取对手信息
const opponent = computed(() => store.state.match.opponent);

// 对战状态
const battleStatus = computed(() => store.state.match.matchStatus);

// 评论相关类型定义
interface Reply {
  id: number;
  username: string;
  content: string;
  createTime: string;
  likeCount: number;
  isLiked: boolean;
}

interface Comment {
  id: number;
  username: string;
  content: string;
  createTime: string;
  likeCount: number;
  isLiked: boolean;
  replies?: Reply[];
}

const props = withDefaults(defineProps<Props>(), {
  id: () => "",
});

const question = ref<QuestionVO>();

const loadData = async () => {
  const res = await QuestionControllerService.getQuestionVoByIdUsingGet(
    props.id as any
  );
  if (res.code == 0) {
    question.value = res.data;
  } else {
    message.error("获取题目列表失败，" + res.message);
  }
};

// 代码模板
const codeTemplates = {
  java:
    "import java.util.*;\n\n" +
    "public class Main {\n" +
    "    public static void main(String[] args) throws Exception {\n\n" +
    "    }\n" +
    "}",
  cpp:
    "#include <iostream>\n" +
    "#include <vector>\n" +
    "#include <algorithm>\n" +
    "using namespace std;\n\n" +
    "int main() {\n\n" +
    "    return 0;\n" +
    "}",
  go:
    "package main\n\n" +
    "import (\n" +
    '    "fmt"\n' +
    ")\n\n" +
    "func main() {\n\n" +
    "}",
};

const form = ref<QuestionSubmitAddRequest>({
  language: "java",
  code: "",
  questionId: props.id as any,
});

const onEditChange = (v: string) => {
  form.value.code = v;
};
const doSubmit = async () => {
  console.log("提交的代码：", form.value);
  const res = await QuestionControllerService.doSubmitUsingPost(form.value);
  console.log("res:", res);
  if (res.code === 0) {
    message.success("提交成功");
    // 如果是对战模式并且提交成功 - 模拟判断为AC (实际项目中需要根据后端判题结果)
    if (isBattleMode.value && res.data) {
      // 模拟判断是否AC (判题通过)
      const isAccepted = true; // 模拟AC
      if (isAccepted) {
        // 创建胜利结果
        const result = {
          winner: store.state.user?.loginUser?.userName,
          time: Date.now() - new Date().getTimezoneOffset() * 60000, // 模拟用时
        };
        // 更新比赛结果
        await store.dispatch("match/endBattle", result);
        // 跳转到结果页面
        setTimeout(() => {
          router.push("/match/result");
        }, 1500);
      }
    }
  } else {
    message.error("提交失败，" + res.message);
  }
};

onMounted(() => {
  loadData();
});

// ==================== 评论功能 ====================
const currentUser = ref("当前用户"); // 模拟当前登录用户
const newComment = ref("");
const comments = ref<Comment[]>([
  {
    id: 1,
    username: "算法小白",
    content:
      "这道题考查的是动态规划，关键在于找到状态转移方程。可以用dp[i]表示到第i个位置的最优解。",
    createTime: "2024-06-28T10:30:00",
    likeCount: 15,
    isLiked: false,
    replies: [
      {
        id: 101,
        username: "当前用户",
        content: "谢谢分享！能详细说一下状态转移方程吗？",
        createTime: "2024-06-28T11:00:00",
        likeCount: 3,
        isLiked: false,
      },
      {
        id: 102,
        username: "算法大神",
        content: "我觉得这题用贪心算法也能解决，时间复杂度更优。",
        createTime: "2024-06-28T11:15:00",
        likeCount: 8,
        isLiked: true,
      },
    ],
  },
  {
    id: 2,
    username: "当前用户",
    content:
      "我用Java写了一个解法，时间复杂度O(n)，空间复杂度O(1)，感觉还不错！",
    createTime: "2024-06-28T09:45:00",
    likeCount: 12,
    isLiked: false,
    replies: [
      {
        id: 201,
        username: "编程爱好者",
        content: "能分享一下代码吗？我也在学Java",
        createTime: "2024-06-28T10:00:00",
        likeCount: 2,
        isLiked: false,
      },
    ],
  },
  {
    id: 3,
    username: "刷题达人",
    content: "这题在力扣上是中等难度，建议先掌握基础的dp思想再来做这类题目。",
    createTime: "2024-06-28T08:20:00",
    likeCount: 6,
    isLiked: true,
    replies: [],
  },
  {
    id: 4,
    username: "面试官小王",
    content:
      "这是一道很好的面试题，不仅考查算法能力，还能看出候选人的思维过程。建议大家多总结不同的解法。",
    createTime: "2024-06-27T16:30:00",
    likeCount: 25,
    isLiked: false,
    replies: [
      {
        id: 401,
        username: "求职者",
        content: "请问面试的时候需要写出完整代码吗？",
        createTime: "2024-06-27T17:00:00",
        likeCount: 1,
        isLiked: false,
      },
      {
        id: 402,
        username: "面试官小王",
        content: "通常先说思路，然后写核心代码就可以了。",
        createTime: "2024-06-27T17:30:00",
        likeCount: 5,
        isLiked: false,
      },
    ],
  },
]);

// 计算排序后的评论列表（自己的评论置顶，然后按时间倒序）
const sortedComments = computed(() => {
  return [...comments.value].sort((a, b) => {
    // 自己的评论置顶
    if (a.username === currentUser.value && b.username !== currentUser.value) {
      return -1;
    }
    if (b.username === currentUser.value && a.username !== currentUser.value) {
      return 1;
    }
    // 按时间倒序排列
    return new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
  });
});

// 发表评论
const submitComment = () => {
  if (!newComment.value.trim()) return;

  const comment: Comment = {
    id: Date.now(),
    username: currentUser.value,
    content: newComment.value.trim(),
    createTime: new Date().toISOString(),
    likeCount: 0,
    isLiked: false,
    replies: [],
  };

  comments.value.unshift(comment);
  newComment.value = "";
  message.success("评论发表成功！");
};

// 处理点赞
const handleLike = (commentId: number) => {
  const comment = comments.value.find((c) => c.id === commentId);
  if (comment) {
    if (comment.isLiked) {
      comment.likeCount--;
      comment.isLiked = false;
    } else {
      comment.likeCount++;
      comment.isLiked = true;
    }
  }
};

// 处理回复
const handleReply = (commentId: number, content: string) => {
  const comment = comments.value.find((c) => c.id === commentId);
  if (comment) {
    const reply: Reply = {
      id: Date.now(),
      username: currentUser.value,
      content: content,
      createTime: new Date().toISOString(),
      likeCount: 0,
      isLiked: false,
    };

    if (!comment.replies) {
      comment.replies = [];
    }
    comment.replies.push(reply);
    message.success("回复发表成功！");
  }
};

// 处理回复点赞
const handleReplyLike = (commentId: number, replyId: number) => {
  const comment = comments.value.find((c) => c.id === commentId);
  if (comment && comment.replies) {
    const reply = comment.replies.find((r) => r.id === replyId);
    if (reply) {
      if (reply.isLiked) {
        reply.likeCount--;
        reply.isLiked = false;
      } else {
        reply.likeCount++;
        reply.isLiked = true;
      }
    }
  }
};
</script>

<style scoped>
#viewQuestionView .arco-space-horizontal .arco-space-item {
  margin-bottom: 0 !important;
}

/* 对战模式指示器样式 */
.battle-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  background-color: #f2f3f5;
  border: 1px solid #e5e6eb;
}

.battle-status {
  display: flex;
  align-items: center;
  color: #165dff;
  font-weight: bold;
}

.battle-text {
  margin-left: 6px;
}

.battle-opponent {
  display: flex;
  align-items: center;
}

.vs-text {
  margin-right: 12px;
  font-weight: bold;
  color: #86909c;
}

.opponent-name {
  font-weight: 500;
}

/* 评论区样式 */
.comment-section {
  max-height: 75vh;
  overflow-y: auto;
}

.comment-form {
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid #e5e6eb;
}

.comment-form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.comment-list {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e6eb;
}

.no-comments {
  padding: 40px;
  text-align: center;
  background: #ffffff;
}
</style>
