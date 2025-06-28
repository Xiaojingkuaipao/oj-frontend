import { nextTick } from "vue";

export function useChat(chatAreaRef) {
  function scrollToBottom() {
    nextTick(() => {
      if (chatAreaRef.value) {
        chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight;
      }
    });
  }

  return {
    scrollToBottom,
  };
}
