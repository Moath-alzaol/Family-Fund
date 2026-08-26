import { StyleSheet, Text, View } from 'react-native';

import { colorForUser, fonts, initialOf } from '@/ui/theme';

interface AvatarProps {
  name: string;
  id: string;
  size?: number;
  radius?: number;
  fontSize?: number;
}

export function Avatar({ name, id, size = 46, radius = 14, fontSize = 19 }: AvatarProps) {
  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: radius, backgroundColor: colorForUser(name, id) },
      ]}
    >
      <Text style={[styles.label, { fontSize }]}>{initialOf(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  label: {
    fontFamily: fonts.bold,
    color: '#fff',
  },
});
