let autoClickInterval = null;

function clickNextButtonIfExists() {
  console.log("🖱️ 클릭");
  const nextBtn = document.querySelector(".btn_modal2.w100");
  if (nextBtn) {
    console.log("다음 버튼 감지");
    nextBtn.click();
  }
}

function startAutoClick() {
  if (!autoClickInterval) {
    autoClickInterval = setInterval(clickNextButtonIfExists, 3000);
    console.log("✅ 자동 수강 시작");
  }
}

function stopAutoClick() {
  if (autoClickInterval) {
    clearInterval(autoClickInterval);
    autoClickInterval = null;
    console.log("🛑 자동 수강 중단");
  }
}

// 초기 상태 확인
chrome.storage.sync.get(["enabled"], (result) => {
  if (result.enabled) {
    startAutoClick();
  }
});

// 메시지 수신 처리
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_AUTO") {
    if (message.enabled) {
      startAutoClick();
    } else {
      stopAutoClick();
    }
  }
});
