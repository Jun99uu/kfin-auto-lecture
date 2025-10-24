let autoClickInterval = null;
let autoLectureInterval = null;

let playbackMonitorInterval = null;
let closeScheduled = false;

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

// MM:SS형식 문자열을 초로 변환
function timeStringToSeconds(timeStr) {
  if (!timeStr) return NaN;
  const parts = timeStr.split(":").map((p) => parseInt(p, 10));
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return NaN;
}

// 플레이타임 감시 시작
function startPlaybackMonitor() {
  if (playbackMonitorInterval) return; // 이미 감시 중이면 중복 시작 방지

  playbackMonitorInterval = setInterval(() => {
    const playTimeEl = document.querySelector("span.play_time");
    const currentEl = document.getElementById("currentFramePage");
    const totalEl = document.getElementById("totalFramePage");

    if (!playTimeEl) return;

    const txt = playTimeEl.textContent || "";
    const parts = txt.split("/");
    if (parts.length < 2) return;

    const elapsedStr = parts[0].trim();
    const totalStr = parts[1].trim();

    const elapsedSec = timeStringToSeconds(elapsedStr);
    const totalSec = timeStringToSeconds(totalStr);

    console.log(elapsedStr, totalStr);

    if (isNaN(elapsedSec) || isNaN(totalSec)) return;

    // 현재 차시 / 총 차시 확인
    let currentPage = null;
    let totalPage = null;
    if (currentEl) {
      const v = parseInt(currentEl.textContent.trim(), 10);
      if (!isNaN(v)) currentPage = v;
    }
    if (totalEl) {
      const ttxt = totalEl.textContent.replace("/", "").trim();
      const v2 = parseInt(ttxt, 10);
      if (!isNaN(v2)) totalPage = v2;
    }

    const isLastChapter =
      currentPage !== null && totalPage !== null && currentPage >= totalPage;

    if (elapsedSec >= totalSec) {
      console.log(
        `⏱ 재생 완료 감지 (elapsed ${elapsedStr} / total ${totalStr}), lastChapter=${isLastChapter}`
      );

      if (isLastChapter) {
        if (!closeScheduled) {
          closeScheduled = true;
          console.log("🗓 마지막 차시 재생 완료 — 3초 후 팝업 닫기 예약");
          // 3초 후 창 닫기
          setTimeout(() => {
            try {
              // 종료 전에 자동 클릭 루틴 중단
              stopAutoClick();
              console.log("🔒 팝업을 닫습니다.");
              window.close();
            } catch (e) {
              console.error("팝업 닫기 실패:", e);
            }
          }, 3000);
        }
      } else {
        console.log("➡ 마지막 차시 아님 — 다음 차시로 이동할 것");
      }
    }
  }, 1000); // 1초마다 체크
}

function stopPlaybackMonitor() {
  if (playbackMonitorInterval) {
    clearInterval(playbackMonitorInterval);
    playbackMonitorInterval = null;
  }
  closeScheduled = false;
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

  // 팝업(강의)에서 재생 감시가 가능하면 감시 시작
  startPlaybackMonitor();
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

  stopPlaybackMonitor();
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
