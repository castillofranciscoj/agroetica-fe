"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

/* -------------------------------------------------
 * Web-component wrapper.
 * We load `emoji-picker-element` only in the browser
 * and expose an onSelect(string) callback.
 * ------------------------------------------------ */
const EmojiPickerDynamic = dynamic(
  async () => {
    // side-effect: registers <emoji-picker>
    await import("emoji-picker-element");
    return () => null; // component itself rendered below
  },
  { ssr: false }
);

export default function EmojiPicker({
  onSelect,
  onClose,
}: {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  /* attach listener once the element exists */
  useEffect(() => {
    const picker = hostRef.current?.querySelector("emoji-picker");
    if (!picker) return;

    const handler = (e: unknown) => {
      const val =
        e.detail.unicode || e.detail.emoji?.char || e.detail.emoji?.unicode;
      if (val) {
        onSelect(val);
        onClose(); // auto-close after selection
      }
    };
    picker.addEventListener("emoji-click", handler);
    return () => picker.removeEventListener("emoji-click", handler);
  }, [onSelect, onClose]);

  return (
    <div
      ref={hostRef}
      className="absolute z-50 border rounded shadow bg-white"
    >
      <EmojiPickerDynamic />
      {/* the real web component */}
      <emoji-picker style={{ width: 320, height: 360 }}></emoji-picker>
    </div>
  );
}
