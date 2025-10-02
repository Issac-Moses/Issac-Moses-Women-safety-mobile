import { useEffect } from "react";

const useShakeToSOS = (onShake: () => void) => {
  useEffect(() => {
    const handleMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const { x = 0, y = 0, z = 0 } = acceleration;
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      console.log("📱 Motion detected:", { x, y, z, magnitude });

      if (magnitude > 12) {
        console.log("🚨 Shake Triggered!");
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
