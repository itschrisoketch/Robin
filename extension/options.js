const DEFAULT_BACKEND = "https://www.buildwithrobin.xyz";
const input = document.getElementById("robin-backend");
const saved = document.getElementById("robin-saved");

chrome.storage.sync.get({ backend: DEFAULT_BACKEND }, (v) => {
  input.value = (v && v.backend) || DEFAULT_BACKEND;
});

document.getElementById("robin-save").addEventListener("click", () => {
  const backend = (input.value || DEFAULT_BACKEND).trim().replace(/\/+$/, "");
  chrome.storage.sync.set({ backend }, () => {
    saved.style.display = "block";
    setTimeout(() => (saved.style.display = "none"), 1500);
  });
});
