// --- EmergencyButton.tsx (inside your component) ---

import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { HeadsetButton, ensureHeadsetListening } from "../plugins/headsetButton";

function callPoliceNow() {
  const tel = "tel:100";
  try {
    // Works on Capacitor Android without extra permission (opens dialer)
    (window as any).location.href = tel;
  } catch {
    // Fallback
    window.open(tel, "_system");
  }
}

useEffect(() => {
  let unsub: { remove: () => void } | undefined;

  ensureHeadsetListening().then(async () => {
    unsub = await HeadsetButton.addListener("headsetButtonPress", ({ keyCode }) => {
      // Debounce or check your app state here if needed
      console.log("Headset media button pressed:", keyCode);
      // Trigger the same action as your on-screen SOS button
      callPoliceNow();
    });
  });

  return () => {
    if (unsub) unsub.remove();
    HeadsetButton.stop().catch(() => {});
  };
}, []);
