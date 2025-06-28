<template>
  <div class="comment-item" :class="{ 'own-comment': isOwnComment }">
    <div class="comment-header">
      <div class="user-info">
        <a-avatar :size="32" :style="{ backgroundColor: '#165dff' }">
          {{ comment.username.charAt(0).toUpperCase() }}
        </a-avatar>
        <span class="username">{{ comment.username }}</span>
        <a-tag v-if="isOwnComment" color="blue" size="small">我的评论</a-tag>
      </div>
      <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
    </div>

    <div class="comment-content">
      {{ comment.content }}
    </div>

    <div class="comment-actions">
      <a-button
        type="text"
        size="small"
        :class="{ liked: comment.isLiked }"
        @click="toggleLike"
      >
        <template #icon>
          <icon-thumb-up />
        </template>
        {{ comment.likeCount }}
      </a-button>

      <a-button type="text" size="small" @click="toggleReply">
        <template #icon>
          <icon-message />
        </template>
        回复
      </a-button>
    </div>

    <!-- 回复输入框 -->
    <div v-if="showReplyInput" class="reply-input">
      <a-textarea
        v-model="replyContent"
        placeholder="写下你的回复..."
        :max-length="500"
        :rows="3"
      />
      <div class="reply-actions">
        <a-button size="small" @click="cancelReply">取消</a-button>
        <a-button
          type="primary"
          size="small"
          @click="submitReply"
          :disabled="!replyContent.trim()"
        >
          发布
        </a-button>
      </div>
    </div>

    <!-- 回复列表 -->
    <div v-if="comment.replies && comment.replies.length > 0" class="replies">
      <div
        v-for="reply in comment.replies"
        :key="reply.id"
        class="reply-item"
        :class="{ 'own-reply': reply.username === currentUser }"
      >
        <div class="reply-header">
          <a-avatar :size="24" :style="{ backgroundColor: '#14c9c9' }">
            {{ reply.username.charAt(0).toUpperCase() }}
          </a-avatar>
          <span class="reply-username">{{ reply.username }}</span>
          <a-tag
            v-if="reply.username === currentUser"
            color="green"
            size="small"
            >我的回复</a-tag
          >
          <span class="reply-time">{{ formatTime(reply.createTime) }}</span>
        </div>
        <div class="reply-content">{{ reply.content }}</div>
        <div class="reply-actions">
          <a-button
            type="text"
            size="mini"
            :class="{ liked: reply.isLiked }"
            @click="toggleReplyLike(reply)"
          >
            <template #icon>
              <icon-thumb-up />
            </template>
            {{ reply.likeCount }}
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { IconThumbUp, IconMessage } from "@arco-design/web-vue/es/icon";

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

interface Props {
  comment: Comment;
  currentUser: string;
}

// eslint-disable-next-line no-undef
const props = defineProps<Props>();
// eslint-disable-next-line no-undef
const emit = defineEmits<{
  like: [commentId: number];
  reply: [commentId: number, content: string];
  replyLike: [commentId: number, replyId: number];
}>();

const showReplyInput = ref(false);
const replyContent = ref("");

const isOwnComment = computed(
  () => props.comment.username === props.currentUser
);

const formatTime = (timeStr: string) => {
  const time = new Date(timeStr);
  const now = new Date();
  const diff = now.getTime() - time.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  return time.toLocaleDateString();
};

const toggleLike = () => {
  emit("like", props.comment.id);
};

const toggleReply = () => {
  showReplyInput.value = !showReplyInput.value;
  if (!showReplyInput.value) {
    replyContent.value = "";
  }
};

const cancelReply = () => {
  showReplyInput.value = false;
  replyContent.value = "";
};

const submitReply = () => {
  if (replyContent.value.trim()) {
    emit("reply", props.comment.id, replyContent.value.trim());
    replyContent.value = "";
    showReplyInput.value = false;
  }
};

const toggleReplyLike = (reply: Reply) => {
  emit("replyLike", props.comment.id, reply.id);
};
</script>

<style scoped>
.comment-item {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #ffffff;
}

.own-comment {
  background: #f6ffed;
  border-left: 3px solid #52c41a;
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-weight: 500;
  color: #1d2129;
}

.comment-time {
  font-size: 12px;
  color: #86909c;
}

.comment-content {
  margin: 8px 0 12px 0;
  line-height: 1.6;
  color: #1d2129;
}

.comment-actions {
  display: flex;
  gap: 16px;
}

.comment-actions .arco-btn.liked {
  color: #165dff;
}

.reply-input {
  margin-top: 12px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 6px;
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.replies {
  margin-top: 12px;
  padding-left: 20px;
  border-left: 2px solid #f0f0f0;
}

.reply-item {
  padding: 8px 12px;
  margin-bottom: 8px;
  background: #fafbfc;
  border-radius: 6px;
}

.own-reply {
  background: #e6f7ff;
  border-left: 2px solid #1890ff;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.reply-username {
  font-size: 13px;
  font-weight: 500;
  color: #1d2129;
}

.reply-time {
  font-size: 11px;
  color: #86909c;
  margin-left: auto;
}

.reply-content {
  font-size: 13px;
  line-height: 1.5;
  color: #1d2129;
  margin-bottom: 4px;
}

.reply-actions {
  display: flex;
  justify-content: flex-start;
}

.reply-actions .arco-btn.liked {
  color: #165dff;
}
</style>
