const input = document.querySelector<HTMLInputElement>("#demo-query")!;
const result = document.querySelector<HTMLElement>("#sample-result")!;
const statusMessage = document.querySelector<HTMLElement>("#demo-status")!;
const match = (value: string) => /maple-742|northwind|original export/i.test(value);

function search() {
  const found = match(input.value);
  result.hidden = !found;
  statusMessage.textContent = found ? "One sample result found. Resetting the demo restores its original records." : "No sample record matched. Try MAPLE-742, Northwind, or original export.";
}

input.addEventListener("input", search);
document.querySelector<HTMLButtonElement>("#reset-demo")!.addEventListener("click", () => {
  input.value = "MAPLE-742";
  search();
  statusMessage.textContent = "Demo reset. One sample result found.";
});
if ("serviceWorker" in navigator && location.protocol === "https:") void navigator.serviceWorker.register("/sw.js");
