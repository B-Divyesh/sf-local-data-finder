import "./route";

const input = document.querySelector<HTMLInputElement>("#demo-query")!;
const result = document.querySelector<HTMLElement>("#sample-result")!;
const statusMessage = document.querySelector<HTMLElement>("#demo-status")!;
const demoStorageKey = "demo:local-data-finder:query";
const match = (value: string) => /maple-742|northwind|original export/i.test(value);

function search() {
  const found = match(input.value);
  result.hidden = !found;
  localStorage.setItem(demoStorageKey, input.value);
  statusMessage.textContent = found ? "One sample result found. Resetting the demo restores its original records." : "No sample record matched. Try MAPLE-742, Northwind, or original export.";
}

input.addEventListener("input", search);
document.querySelector<HTMLButtonElement>("#reset-demo")!.addEventListener("click", () => {
  input.value = "MAPLE-742";
  search();
  statusMessage.textContent = "Demo reset. One sample result found.";
});
document.querySelector<HTMLButtonElement>("#start-for-real")!.addEventListener("click", () => {
  localStorage.removeItem(demoStorageKey);
  location.assign("/");
});

input.value = localStorage.getItem(demoStorageKey) || "MAPLE-742";
search();

if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "127.0.0.1" || location.hostname === "localhost")) {
  void navigator.serviceWorker.register("/sw.js");
}
