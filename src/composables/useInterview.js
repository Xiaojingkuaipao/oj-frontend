import { ref } from "vue";

export function useInterview() {
  const messages = ref([
    {
      type: "interviewer",
      content:
        "您好！欢迎参加今天的面试。我是您的AI面试官，今天我们将进行一场模拟技术面试。请先做个简单的自我介绍吧。",
      time: formatTime(new Date()),
    },
  ]);

  const isTyping = ref(false);
  let questionIndex = 0;

  const interviewQuestions = [
    "请介绍一下您在前端开发方面的经验。",
    "您如何理解Vue.js的响应式原理？",
    "请说说您对组件化开发的理解。",
    "您在项目中遇到过什么技术难题，是如何解决的？",
    "您如何保证代码质量和项目的可维护性？",
    "请谈谈您对性能优化的看法和实践。",
    "您有什么问题想要问我吗？",
  ];

  function formatTime(date) {
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function addMessage(message) {
    messages.value.push(message);
  }

  function simulateAIResponse() {
    isTyping.value = true;

    setTimeout(() => {
      isTyping.value = false;

      let response = "";

      if (questionIndex < interviewQuestions.length) {
        if (questionIndex === 0) {
          response = "很好！" + interviewQuestions[questionIndex];
        } else if (questionIndex === interviewQuestions.length - 1) {
          response = "感谢您详细的回答。" + interviewQuestions[questionIndex];
        } else {
          response =
            "理解了，让我们继续下一个问题。" +
            interviewQuestions[questionIndex];
        }
        questionIndex++;
      } else {
        response =
          "今天的面试就到这里，感谢您的参与！您的表现很棒，我们会尽快给您反馈。";
      }

      addMessage({
        type: "interviewer",
        content: response,
        time: formatTime(new Date()),
      });
    }, 1500 + Math.random() * 1000);
  }

  // 重置面试状态（可选功能）
  function resetInterview() {
    messages.value = [
      {
        type: "interviewer",
        content:
          "您好！欢迎参加今天的面试。我是您的AI面试官，今天我们将进行一场模拟技术面试。请先做个简单的自我介绍吧。",
        time: formatTime(new Date()),
      },
    ];
    questionIndex = 0;
    isTyping.value = false;
  }

  return {
    messages,
    isTyping,
    addMessage,
    simulateAIResponse,
    resetInterview,
  };
}
