const button = document.getElementById("toggle-button");

chrome.storage.sync.get(["enabled"], (result) => {
  updateButton(result.enabled);
});

button.addEventListener("click", () => {
  chrome.storage.sync.get(["enabled"], (result) => {
    const newStatus = !result.enabled;
    chrome.storage.sync.set({ enabled: newStatus }, () => {
      updateButton(newStatus);

      // 현재 탭에 메시지 전송
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "TOGGLE_AUTO",
          enabled: newStatus,
        });
      });
    });
  });
});

function updateButton(isEnabled) {
  if (isEnabled) {
    button.textContent = "자동수강 켜짐";
    button.style.backgroundColor = "#4CAF50";
    button.style.color = "#FFFFFF";
  } else {
    button.textContent = "자동수강 꺼짐";
    button.style.backgroundColor = "#CCCCCC";
    button.style.color = "#000000";
  }
}
