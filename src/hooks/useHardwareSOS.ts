import { useEffect } from "react";

export function useHardwareSOS(triggerSOS: () => void) {
  useEffect(() => {
    const handler = () => {
      triggerSOS();
    };

    window.addEventListener("hardwareSOS", handler);

    return () => {
      window.removeEventListener("hardwareSOS", handler);
    };
  }, [triggerSOS]);
}
