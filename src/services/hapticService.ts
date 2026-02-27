export const haptic = {
  light: () => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  },
  medium: () => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(20);
    }
  },
  heavy: () => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(40);
    }
  },
  success: () => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate([20, 50, 20]);
    }
  },
  error: () => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate([50, 100, 50, 100]);
    }
  }
};
