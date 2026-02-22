export interface DeviceProfile {
  isTouchCapable: boolean;
  prefersCoarsePointer: boolean;
  isPhoneViewport: boolean;
  isCompactHud: boolean;
}

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

function hasNavigator(): boolean {
  return typeof navigator !== "undefined";
}

function mediaMatches(query: string): boolean {
  if (!hasWindow() || !window.matchMedia) {
    return false;
  }
  return window.matchMedia(query).matches;
}

export function getDeviceProfile(width: number, height: number): DeviceProfile {
  const prefersCoarsePointer = mediaMatches("(pointer: coarse)") || mediaMatches("(any-pointer: coarse)");
  const maxTouchPoints = hasNavigator() ? navigator.maxTouchPoints ?? 0 : 0;
  const isTouchCapable = prefersCoarsePointer || maxTouchPoints > 0;

  const shortEdge = Math.min(width, height);
  const longEdge = Math.max(width, height);
  const isPhoneViewport = shortEdge <= 540 && longEdge <= 1120;
  const isCompactHud = width < 980 || height < 620;

  return {
    isTouchCapable,
    prefersCoarsePointer,
    isPhoneViewport,
    isCompactHud,
  };
}

export function isLikelyTouchDevice(): boolean {
  const profile = getDeviceProfile(hasWindow() ? window.innerWidth : 1280, hasWindow() ? window.innerHeight : 720);
  return profile.prefersCoarsePointer || (profile.isTouchCapable && profile.isPhoneViewport);
}
