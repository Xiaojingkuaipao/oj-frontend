<template>
  <div class="battle-room-container">
    <!-- 顶部状态栏 -->
    <div class="battle-header">
      <div class="header-content">
        <!-- 左侧用户信息 -->
        <div class="user-section">
          <div class="user-avatar">
            <div class="avatar-circle user">{{ userInitials }}</div>
          </div>
          <div class="user-info">
            <div class="user-name">{{ userName }}</div>
            <div class="user-status">
              <div class="status-indicator ready"></div>
              <span>就绪</span>
            </div>
          </div>
        </div>

        <!-- 中间对战信息 -->
        <div class="battle-info">
          <div class="battle-title">实时对战</div>
          <div class="question-info">
            <div class="question-title">{{ questionTitle }}</div>
            <div class="difficulty">
              <a-tag color="orange">中等</a-tag>
            </div>
          </div>
          <div class="timer-section">
            <div class="timer">{{ formatTime(remainingTime) }}</div>
            <div class="timer-label">剩余时间</div>
          </div>
        </div>

        <!-- 右侧对手信息 -->
        <div class="opponent-section">
          <div class="user-info">
            <div class="user-name">{{ opponentName }}</div>
            <div class="user-status">
              <div class="status-indicator coding"></div>
              <span>编码中</span>
            </div>
          </div>
          <div class="user-avatar">
            <div class="avatar-circle opponent">{{ opponentInitials }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要对战区域 -->
    <div class="battle-main">
      <!-- 题目描述区域 -->
      <div class="problem-section">
        <a-card class="problem-card">
          <template #title>
            <div class="problem-header">
              <span>题目描述</span>
              <a-button size="small" type="text" @click="toggleProblem">
                {{ showProblem ? "收起" : "展开" }}
              </a-button>
            </div>
          </template>
          <div v-show="showProblem" class="problem-content">
            <h3>两数之和</h3>
            <p>
              给定一个整数数组 nums 和一个整数目标值
              target，请你在该数组中找出和为目标值 target
              的那两个整数，并返回它们的数组下标。
            </p>

            <div class="example">
              <h4>示例 1：</h4>
              <div class="code-block">
                <pre>
输入：nums = [2,7,11,15], target = 9
输出：[0,1]
解释：因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。</pre
                >
              </div>
            </div>

            <div class="constraints">
              <h4>提示：</h4>
              <ul>
                <li>2 ≤ nums.length ≤ 10⁴</li>
                <li>-10⁹ ≤ nums[i] ≤ 10⁹</li>
                <li>-10⁹ ≤ target ≤ 10⁹</li>
              </ul>
            </div>
          </div>
        </a-card>
      </div>

      <!-- 双人编码区域 -->
      <div class="coding-section">
        <div class="code-areas">
          <!-- 我的编码区 -->
          <div class="code-area my-area">
            <div class="code-header">
              <div class="area-title">
                <span>我的代码</span>
                <div class="progress-info">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: myProgress + '%' }"
                    ></div>
                  </div>
                  <span class="progress-text">{{ myProgress }}%</span>
                </div>
              </div>
              <div class="actions">
                <a-button size="small" @click="runCode">运行</a-button>
                <a-button size="small" type="primary" @click="submitCode"
                  >提交</a-button
                >
              </div>
            </div>
            <div class="code-editor">
              <textarea
                v-model="myCode"
                class="code-textarea"
                placeholder="在这里编写您的代码..."
                rows="20"
              ></textarea>
            </div>
            <div class="test-result" v-if="myTestResult">
              <div class="result-header">
                <span>测试结果</span>
                <a-tag
                  :color="myTestResult.status === 'success' ? 'green' : 'red'"
                >
                  {{ myTestResult.status === "success" ? "通过" : "失败" }}
                </a-tag>
              </div>
              <div class="result-content">
                {{ myTestResult.message }}
              </div>
            </div>
          </div>

          <!-- 对手编码区（实时同步显示） -->
          <div class="code-area opponent-area">
            <div class="code-header">
              <div class="area-title">
                <span>{{ opponentName }}的代码</span>
                <div class="progress-info">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: opponentProgress + '%' }"
                    ></div>
                  </div>
                  <span class="progress-text">{{ opponentProgress }}%</span>
                </div>
              </div>
              <div class="opponent-status">
                <div class="typing-indicator" v-if="opponentTyping">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span v-else>思考中...</span>
              </div>
            </div>
            <div class="code-editor opponent-editor">
              <div class="opponent-code">{{ opponentCode }}</div>
              <div class="code-cursor" v-if="opponentTyping"></div>
            </div>
            <div class="test-result" v-if="opponentTestResult">
              <div class="result-header">
                <span>测试结果</span>
                <a-tag
                  :color="
                    opponentTestResult.status === 'success' ? 'green' : 'red'
                  "
                >
                  {{
                    opponentTestResult.status === "success" ? "通过" : "失败"
                  }}
                </a-tag>
              </div>
              <div class="result-content">
                {{ opponentTestResult.message }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 结果弹窗 -->
    <a-modal
      v-model:visible="showResult"
      title="对战结果"
      :closable="false"
      :mask-closable="false"
      width="600px"
    >
      <div class="result-modal">
        <div class="result-icon">
          <div class="winner-badge" v-if="battleResult === 'win'">🏆</div>
          <div class="loser-badge" v-else-if="battleResult === 'lose'">😢</div>
          <div class="draw-badge" v-else>🤝</div>
        </div>
        <div class="result-title">
          <span v-if="battleResult === 'win'">恭喜获胜！</span>
          <span v-else-if="battleResult === 'lose'">遗憾失败</span>
          <span v-else>平局</span>
        </div>
        <div class="result-stats">
          <div class="stat-item">
            <div class="stat-label">用时</div>
            <div class="stat-value">{{ formatTime(usedTime) }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">通过率</div>
            <div class="stat-value">{{ successRate }}%</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">代码行数</div>
            <div class="stat-value">{{ codeLines }}</div>
          </div>
        </div>
      </div>
      <template #footer>
        <a-button @click="goBack">返回主页</a-button>
        <a-button type="primary" @click="playAgain">再来一局</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import message from "@arco-design/web-vue/es/message";

const router = useRouter();

// 用户信息
const userName = ref("你");
const userInitials = ref("你");
const opponentName = ref("智能对手");
const opponentInitials = ref("AI");

// 题目信息
const questionTitle = ref("两数之和");
const showProblem = ref(true);

// 时间相关
const remainingTime = ref(600); // 10分钟
const usedTime = ref(0);

// 编码相关
const myCode = ref(`function twoSum(nums, target) {
    // 在这里编写您的解决方案
    
}`);

const opponentCode = ref(`def two_sum(nums, target):
    # AI正在思考最优解...
    hash_map = {}
    for i, num in enumerate(nums):`);

const myProgress = ref(25);
const opponentProgress = ref(45);
const opponentTyping = ref(true);

// 测试结果
const myTestResult = ref<{ status: string; message: string } | null>(null);
const opponentTestResult = ref({
  status: "success",
  message: "通过 3/5 个测试用例",
});

// 对战结果
const showResult = ref(false);
const battleResult = ref("win"); // win/lose/draw
const successRate = ref(85);
const codeLines = ref(12);

let timer: number | null = null;
let opponentSimTimer: number | null = null;

// 格式化时间显示
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

// 切换题目显示
const toggleProblem = () => {
  showProblem.value = !showProblem.value;
};

// 运行代码
const runCode = () => {
  message.info("正在运行代码...");
  setTimeout(() => {
    myTestResult.value = {
      status: "success",
      message: "通过 2/5 个测试用例，继续加油！",
    };
    myProgress.value = 40;
  }, 1500);
};

// 提交代码
const submitCode = () => {
  message.info("正在提交代码...");
  setTimeout(() => {
    myTestResult.value = {
      status: "success",
      message: "恭喜！通过所有测试用例",
    };
    myProgress.value = 100;

    // 模拟对战结束
    setTimeout(() => {
      endBattle();
    }, 2000);
  }, 2000);
};

// 结束对战
const endBattle = () => {
  if (timer) {
    clearInterval(timer);
  }
  if (opponentSimTimer) {
    clearInterval(opponentSimTimer);
  }

  usedTime.value = 600 - remainingTime.value;
  showResult.value = true;
};

// 返回主页
const goBack = () => {
  router.push("/");
};

// 再来一局
const playAgain = () => {
  router.push("/battle/matching");
};

// 模拟对手编码过程
const simulateOpponent = () => {
  const codeSteps = [
    `def two_sum(nums, target):
    # AI正在思考最优解...
    hash_map = {}`,

    `def two_sum(nums, target):
    # AI正在思考最优解...
    hash_map = {}
    for i, num in enumerate(nums):`,

    `def two_sum(nums, target):
    # AI正在思考最优解...
    hash_map = {}
    for i, num in enumerate(nums):
        complement = target - num`,

    `def two_sum(nums, target):
    # AI正在思考最优解...
    hash_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hash_map:
            return [hash_map[complement], i]`,

    `def two_sum(nums, target):
    # AI正在思考最优解...
    hash_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hash_map:
            return [hash_map[complement], i]
        hash_map[num] = i
    return []`,
  ];

  let step = 0;
  opponentSimTimer = window.setInterval(() => {
    if (step < codeSteps.length) {
      opponentCode.value = codeSteps[step];
      opponentProgress.value = Math.min(20 + step * 15, 90);
      step++;
    } else {
      // AI完成编码
      opponentTyping.value = false;
      opponentProgress.value = 100;
      opponentTestResult.value = {
        status: "success",
        message: "通过所有测试用例",
      };
      if (opponentSimTimer) {
        clearInterval(opponentSimTimer);
      }
    }
  }, 3000);
};

onMounted(() => {
  // 启动倒计时
  timer = window.setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--;
    } else {
      endBattle();
    }
  }, 1000);

  // 启动对手模拟
  setTimeout(() => {
    simulateOpponent();
  }, 2000);

  // 模拟5分钟后自动结束（演示用）
  setTimeout(() => {
    if (remainingTime.value > 300) {
      remainingTime.value = 30; // 快速演示结果
    }
  }, 8000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
  if (opponentSimTimer) {
    clearInterval(opponentSimTimer);
  }
});
</script>

<style scoped>
.battle-room-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

/* 顶部状态栏 */
.battle-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
}

.user-section,
.opponent-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  position: relative;
}

.avatar-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  color: white;
}

.avatar-circle.user {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.avatar-circle.opponent {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.user-info {
  text-align: left;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-indicator.ready {
  background: #10b981;
}

.status-indicator.coding {
  background: #f59e0b;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.battle-info {
  text-align: center;
  flex: 1;
  max-width: 400px;
}

.battle-title {
  font-size: 20px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 8px;
}

.question-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.question-title {
  font-size: 16px;
  color: #374151;
}

.timer-section {
  text-align: center;
}

.timer {
  font-size: 32px;
  font-weight: bold;
  color: #3b82f6;
  font-family: "Monaco", "Courier New", monospace;
}

.timer-label {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 主要区域 */
.battle-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 16px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* 题目区域 */
.problem-section {
  flex-shrink: 0;
}

.problem-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.problem-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.problem-content h3 {
  color: #1f2937;
  margin-bottom: 16px;
}

.problem-content p {
  color: #374151;
  line-height: 1.6;
  margin-bottom: 16px;
}

.example {
  margin: 16px 0;
}

.example h4 {
  color: #1f2937;
  margin-bottom: 8px;
}

.code-block {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px;
}

.code-block pre {
  margin: 0;
  font-family: "Monaco", "Courier New", monospace;
  font-size: 14px;
  color: #2d3748;
}

.constraints ul {
  color: #4a5568;
  padding-left: 20px;
}

/* 编码区域 */
.coding-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.code-areas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  height: 100%;
}

.code-area {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.code-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(249, 250, 251, 0.8);
}

.area-title {
  display: flex;
  align-items: center;
  gap: 16px;
  font-weight: 600;
  color: #1f2937;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  width: 80px;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #06b6d4);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #6b7280;
  min-width: 32px;
}

.actions {
  display: flex;
  gap: 8px;
}

.code-editor {
  flex: 1;
  position: relative;
}

.code-textarea {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  padding: 16px;
  font-family: "Monaco", "Courier New", monospace;
  font-size: 14px;
  line-height: 1.5;
  background: transparent;
  resize: none;
  color: #1f2937;
}

.opponent-editor {
  padding: 16px;
  background: #f8fafc;
  font-family: "Monaco", "Courier New", monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #1f2937;
  white-space: pre-wrap;
  position: relative;
}

.opponent-code {
  min-height: 300px;
}

.code-cursor {
  width: 2px;
  height: 20px;
  background: #3b82f6;
  position: absolute;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

.opponent-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background: #3b82f6;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}
.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.test-result {
  border-top: 1px solid #e5e7eb;
  padding: 16px;
  background: rgba(249, 250, 251, 0.8);
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 600;
  color: #1f2937;
}

.result-content {
  font-size: 14px;
  color: #6b7280;
}

/* 结果弹窗 */
.result-modal {
  text-align: center;
  padding: 20px 0;
}

.result-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.winner-badge,
.loser-badge,
.draw-badge {
  font-size: 80px;
  animation: bounce 0.6s ease-in-out;
}

@keyframes bounce {
  0%,
  20%,
  53%,
  80%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  40%,
  43% {
    transform: translate3d(0, -20px, 0);
  }
  70% {
    transform: translate3d(0, -10px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}

.result-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
  color: #1f2937;
}

.result-stats {
  display: flex;
  justify-content: space-around;
  gap: 20px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #1f2937;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .code-areas {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .user-section,
  .opponent-section {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .battle-main {
    padding: 16px;
  }

  .timer {
    font-size: 24px;
  }

  .code-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
