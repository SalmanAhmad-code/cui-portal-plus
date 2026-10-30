(() => {
  let url,
    element,
    revision = -1,
    request = 0;
  async function apply(s) {
    const ticket = ++request;
    document.getElementById("dim").style.opacity = s.backgroundDim / 100;
    if (revision !== s.mediaRevision) {
      const file = await PortalMedia.get().catch(() => null);
      if (ticket !== request) return;
      revision = s.mediaRevision;
      element?.remove();
      if (url) URL.revokeObjectURL(url);
      url = null;
      element = null;
      if (file) {
        url = URL.createObjectURL(file);
        element = document.createElement(
          file.type.startsWith("video/") ? "video" : "img",
        );
        if (element.tagName === "VIDEO") {
          element.muted = true;
          element.loop = true;
          element.autoplay = true;
          element.playsInline = true;
        } else element.alt = "";
        element.src = url;
        document.getElementById("media").append(element);
      }
    }
    if (element) {
      element.style.objectFit = s.backgroundFit;
      if (element.tagName === "VIDEO") {
        if (s.reduceMotion || document.hidden) element.pause();
        else element.play().catch(() => {});
      }
    }
  }
  PortalSettings.subscribe(apply);
  PortalSettings.get().then(apply);
  document.addEventListener("visibilitychange", () => {
    PortalSettings.get()
      .then(apply)
      .catch((error) => {
        if (!String(error?.message).includes("Extension context invalidated")) {
          console.error(error);
        }
      });
  });
  addEventListener("pagehide", () => {
    if (url) URL.revokeObjectURL(url);
  });
})();
