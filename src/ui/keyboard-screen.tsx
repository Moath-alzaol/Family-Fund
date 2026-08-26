import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, type ViewStyle } from 'react-native';

// iOS needs an explicit height/padding shift when the keyboard appears —
// Android's `softwareKeyboardLayoutMode: "resize"` (app.json) already
// shrinks the window itself, so behavior stays undefined there to avoid
// double-shifting the content.
export function KeyboardAvoidingScreen({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return (
    <KeyboardAvoidingView style={[styles.flex, style]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
