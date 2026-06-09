import { Capacitor } from '@capacitor/core';

export const isNativePlatform = Capacitor.isNativePlatform();
export const nativePlatform = Capacitor.getPlatform();

/** Native shell init — no Capacitor plugins until SPM/API alignment is fixed (capacitor#8333). */
export function initCapacitorNative() {}
