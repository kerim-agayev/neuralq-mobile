import * as Haptics from 'expo-haptics';

export function useHaptic() {
  const correctFeedback = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const wrongFeedback = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const tapFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return { correctFeedback, wrongFeedback, tapFeedback };
}
