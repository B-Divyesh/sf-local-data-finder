const routeIntentKey = "local-data-finder:route-intent";

function announceRoute(): void {
  const heading = document.querySelector<HTMLHeadingElement>("main h1");
  const announcement = document.querySelector<HTMLElement>("#route-announcement");
  if (!heading || !announcement) return;
  heading.focus({ preventScroll: true });
  announcement.textContent = "";
  window.setTimeout(() => {
    announcement.textContent = document.title;
  }, 0);
}

function isSameSiteDocumentLink(link: HTMLAnchorElement): boolean {
  const destination = new URL(link.href, location.href);
  return destination.origin === location.origin && destination.pathname !== location.pathname && !link.hasAttribute("download");
}

document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !isSameSiteDocumentLink(link)) return;
    sessionStorage.setItem(routeIntentKey, "heading");
  });
});

const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
if (sessionStorage.getItem(routeIntentKey) === "heading" || navigation?.type === "back_forward") {
  sessionStorage.removeItem(routeIntentKey);
  window.addEventListener("load", announceRoute, { once: true });
}

window.addEventListener("pageshow", (event) => {
  if (event.persisted) announceRoute();
});
