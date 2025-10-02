// src/utils/bluetooth.ts
import {
  BleClient,
  BleDevice,
  numbersToDataView,
  textToDataView,
} from '@capacitor-community/bluetooth-le';

// ===== Initialization =====
export async function initBle() {
  try {
    await BleClient.initialize();
    console.log('✅ BLE initialized');
  } catch (err) {
    console.error('❌ BLE init error:', err);
  }
}

// ===== Permissions =====
export async function requestBlePermissions() {
  try {
    // Request location + BLE permissions (Android 12+ needs both BLUETOOTH_SCAN + BLUETOOTH_CONNECT)
    if (Capacitor.getPlatform() === 'android') {
      const perms = [
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.BLUETOOTH_SCAN',
        'android.permission.BLUETOOTH_CONNECT',
      ];
      for (const perm of perms) {
        // @ts-ignore - Cordova/Capacitor bridge runtime
        const granted = await PermissionsAndroid.request(perm);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error(`Permission denied: ${perm}`);
        }
      }
    }

    // Trigger BLE permission check via a short scan
    await BleClient.requestLEScan({}, () => {});
    await BleClient.stopLEScan();

    console.log('✅ BLE permissions granted');
  } catch (err) {
    console.error('❌ BLE permission request failed:', err);
    throw err;
  }
}

// ===== Generic Device Scan =====
export async function scanForDevices(
  seconds = 5,
  onDevice?: (device: BleDevice) => void
) {
  try {
    await BleClient.requestLEScan(
      { allowDuplicates: false },
      (result) => {
        console.log('📡 Found device:', result);
        if (onDevice) onDevice(result);
      }
    );

    console.log(`🔍 Scanning for ${seconds} seconds...`);
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));

    await BleClient.stopLEScan();
    console.log('⏹ Scan stopped');
  } catch (err) {
    console.error('❌ BLE scan error:', err);
  }
}

// ===== Connect & Disconnect =====
export async function connectToDevice(deviceId: string) {
  try {
    await BleClient.connect(deviceId);
    console.log(`🔗 Connected to ${deviceId}`);
  } catch (err) {
    console.error('❌ BLE connect error:', err);
  }
}

export async function disconnectFromDevice(deviceId: string) {
  try {
    await BleClient.disconnect(deviceId);
    console.log(`🔌 Disconnected from ${deviceId}`);
  } catch (err) {
    console.error('❌ BLE disconnect error:', err);
  }
}

// ===== Feather-specific helpers =====
export async function scanForFeather(seconds = 5) {
  console.log('🔍 Scanning for Feather device...');
  await scanForDevices(seconds, (device) => {
    if (device?.device?.name?.toLowerCase().includes('feather')) {
      console.log('🪶 Found Feather:', device);
    }
  });
}

export async function connectToFeather(deviceId: string) {
  console.log('🔗 Connecting to Feather device...');
  await connectToDevice(deviceId);
}

// ===== Exports for BLE writes =====
export { numbersToDataView, textToDataView };
