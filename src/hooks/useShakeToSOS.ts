import { useEffect } from "react";

const useShakeToSOS = (onShake: () => void) => {
  useEffect(() => {
    let lastTime = 0;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const { x = 0, y = 0, z = 0 } = acceleration;
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      const now = Date.now();

      // ✅ Adjust threshold after testing: 15–18 works well for Android
      if (magnitude > 15 && now - lastTime > 1000) {
        lastTime = now;
        onShake();
      }
    };

    window.addEventListener("devicemotion", handleMotion, true);

    return () => {
      window.removeEventListener("devicemotion", handleMotion, true);
    };
  }, [onShake]);
};

export default useShakeToSOS;
