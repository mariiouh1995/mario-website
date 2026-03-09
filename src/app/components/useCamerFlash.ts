import { useCallback, useRef } from "react";

/**
 * Creates a camera shutter flash animation when a button is clicked.
 * Shows a 📸 emoji that scales up with a white flash overlay, then fades out.
 *
 * Usage:
 *   const { flashRef, triggerFlash } = useCameraFlash();
 *   <button ref={flashRef} onClick={(e) => { triggerFlash(e); yourHandler(); }}>
 */
export function useCameraFlash() {
  const flashRef = useRef<HTMLElement | null>(null);

  const triggerFlash = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();

    // Create the camera emoji
    const emoji = document.createElement("span");
    emoji.textContent = "\u{1F4F8}";
    emoji.style.cssText = `
      position: fixed;
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top + rect.height / 2}px;
      transform: translate(-50%, -50%) scale(0.5) rotate(-15deg);
      font-size: 2rem;
      pointer-events: none;
      z-index: 99999;
      opacity: 0;
      animation: camera-flash 600ms ease-out forwards;
    `;
    document.body.appendChild(emoji);

    // Create flash overlay on the button
    const flash = document.createElement("div");
    flash.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      background: white;
      border-radius: 12px;
      pointer-events: none;
      z-index: 99998;
      opacity: 0;
      animation: flash-overlay 400ms ease-out forwards;
    `;
    document.body.appendChild(flash);

    // Clean up after animation
    setTimeout(() => {
      emoji.remove();
      flash.remove();
    }, 700);
  }, []);

  return { flashRef, triggerFlash };
}
