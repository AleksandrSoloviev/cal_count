const isIosDevice = (): boolean => {
  if (typeof navigator === "undefined") return false;
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
};

const triggerAnchorDownload = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.setAttribute("aria-hidden", "true");
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
};

export const saveDumpToDevice = async (json: string, filename: string): Promise<void> => {
  const blob = new Blob([json], { type: "application/json" });
  const file = new File([blob], filename, { type: "application/json" });

  if (isIosDevice() && typeof navigator.share === "function") {
    const shareData: ShareData = { files: [file], title: filename };
    const canShare = typeof navigator.canShare !== "function" || navigator.canShare(shareData);
    if (canShare) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
  }

  triggerAnchorDownload(blob, filename);
};
