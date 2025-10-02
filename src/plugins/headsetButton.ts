import { registerPlugin } from '@capacitor/core';

export interface HeadsetButtonPlugin {
  start(): Promise<void>;
  stop(): Promise<void>;
  addListener(
    eventName: 'headsetButtonPress',
    listenerFunc: (data: { keyCode: number }) => void
  ): Promise<{ remove: () => void }>;
}

// Named export for your current code
export const HeadsetButton = registerPlugin<HeadsetButtonPlugin>('HeadsetButton');

// Helper to ensure we start listening
export async function ensureHeadsetListening() {
  try {
    await HeadsetButton.start();
  } catch (err) {
    console.error('Error starting headset listener:', err);
  }
}

// Default export for compatibility
export default HeadsetButton;
