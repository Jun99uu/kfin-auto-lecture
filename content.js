let autoClickInterval = null;
let autoLectureInterval = null;

// 마우스 터치 이벤트 (강제 발생)
function simulateClick(element) {
  if (element) {
    const event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
      button: 0,
    });

    element.dispatchEvent(event);
  }
}

// 크롬 정책 우회 -> 영상 자동재생 함수
function forceAutoplayVideo() {
  const video = document.getElementById("tVideo");
  if (video) {
    video.muted = true; // 크롬 정책 우회
    video.autoplay = true;
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");

    // load() 호출로 갱신 후 재생 시도
    video.load();
    video
      .play()
      .then(() => {
        console.log("✅ 자동 재생 성공");
      })
      .catch((err) => {
        console.error("❌ 자동 재생 실패:", err);
      });
  } else {
    console.log("⏳ video 요소를 찾을 수 없습니다. 재시도 대기...");
  }
}

function clickNextButtonIfExists() {
  console.log("🖱️ 클릭");

  const mobileView = document.getElementById("mobileView");
  if (mobileView && mobileView.style.display !== "none") {
    console.log("📱 mobileView 터치 이벤트 발생");
    simulateClick(mobileView); // 터치 이벤트를 시뮬레이션 => 재생UI 변경

    const checkInterval = setInterval(() => {
      const video = document.getElementById("tVideo");
      if (video) {
        clearInterval(checkInterval);
        forceAutoplayVideo();
      }
    }, 1000);
  }

  const nextBtn = document.getElementById("nextBtn");
  if (nextBtn) {
    console.log("⏭️ 다음 버튼 감지");
    nextBtn.click();
  }

  const checkBtn = document.querySelector(".btn_modal2.w100");
  if (checkBtn) {
    console.log("✅ 확인 버튼 감지");
    checkBtn.click();
  }
}

function openNextLecture() {
  const steps = document.querySelectorAll(".step_div");
  for (let step of steps) {
    const status = step.querySelector("span.s_num");
    const category = step.querySelector("span.cat");

    if (category) {
      const text = category.textContent.trim();
      if (text.includes("시험") || text.includes("설문")) {
        console.log(`🚫 [${text}] 건너뜀`);
        continue;
      }
    }

    if (status && !status.classList.contains("checked")) {
      const learnBtn = step.querySelector(".btn.btn-primary");
      if (learnBtn) {
        console.log("📚 다음 차시 열기");
        learnBtn.click();
        return true;
      }
    }
  }
}

function startAutoClick() {
  if (!autoClickInterval) {
    autoClickInterval = setInterval(clickNextButtonIfExists, 3000);
    console.log("✅ 자동 수강 시작");
  }

  if (!autoLectureInterval) {
    autoLectureInterval = setInterval(openNextLecture, 5000);
    console.log("✅ 다음 차시 자동 열기 시작");
  }
}

function stopAutoClick() {
  if (autoClickInterval) {
    clearInterval(autoClickInterval);
    autoClickInterval = null;
    console.log("🛑 자동 수강 중단");
  }

  if (autoLectureInterval) {
    clearInterval(autoLectureInterval);
    autoLectureInterval = null;
    console.log("🛑 다음 차시 자동 열기 중단");
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
