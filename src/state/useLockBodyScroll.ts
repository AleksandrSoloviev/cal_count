import { useEffect } from "react";

const SHEET_SCROLL = "[data-sheet-scroll]";

const scrollableSheet = (target: EventTarget | null): HTMLElement | null => {
  if (!(target instanceof Element)) return null;
  const scroller = target.closest(SHEET_SCROLL);
  return scroller instanceof HTMLElement ? scroller : null;
};

const canScrollFurther = (scroller: HTMLElement, deltaY: number): boolean => {
  const maxScroll = scroller.scrollHeight - scroller.clientHeight;
  if (maxScroll <= 1) return false;
  if (deltaY < 0 && scroller.scrollTop <= 0) return false;
  if (deltaY > 0 && scroller.scrollTop >= maxScroll - 1) return false;
  return true;
};

/** Keeps the page behind an open sheet from scrolling, including at the sheet's edges. */
export const useLockBodyScroll = (locked: boolean) => {
  useEffect(() => {
    if (!locked) return;

    const html = document.documentElement;
    const { body } = document;
    const scrollY = window.scrollY;
    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
      bodyOverscroll: body.style.overscrollBehavior,
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";
    if (window.scrollY !== scrollY) window.scrollTo(0, scrollY);

    let lastTouchY = 0;

    const handleTouchStart = (event: TouchEvent) => {
      lastTouchY = event.touches[0]?.clientY ?? 0;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const nextY = event.touches[0]?.clientY ?? lastTouchY;
      const delta = lastTouchY - nextY;
      lastTouchY = nextY;
      const scroller = scrollableSheet(event.target);
      if (!scroller || !canScrollFurther(scroller, delta)) event.preventDefault();
    };

    const handleWheel = (event: WheelEvent) => {
      const scroller = scrollableSheet(event.target);
      if (!scroller || !canScrollFurther(scroller, event.deltaY)) event.preventDefault();
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      html.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
      html.style.overscrollBehavior = previous.htmlOverscroll;
      body.style.overscrollBehavior = previous.bodyOverscroll;
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("wheel", handleWheel);
      if (window.scrollY !== scrollY) window.scrollTo(0, scrollY);
    };
  }, [locked]);
};
