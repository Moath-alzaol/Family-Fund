import { Alert, Platform } from 'react-native';

// react-native-web's Alert.alert is a total no-op — it never reaches the
// browser, so web users would get silent success/failure with no feedback.
export function notify(message: string) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(message);
    return;
  }
  Alert.alert(message);
}
