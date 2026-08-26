import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, type TouchableOpacityProps } from 'react-native';

import { colors, fonts, radii } from '@/ui/theme';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'gold' | 'success' | 'danger' | 'ghost' | 'dangerGhost';
  loading?: boolean;
}

export function Button({ label, variant = 'gold', loading, disabled, style, ...props }: ButtonProps) {
  const labelColor = variant === 'dangerGhost' ? colors.danger : variant === 'ghost' ? colors.ink : '#fff';
  const content = loading ? (
    <ActivityIndicator color={labelColor} />
  ) : (
    <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
  );

  if (variant === 'gold') {
    return (
      <TouchableOpacity {...props} disabled={disabled || loading} style={[disabled || loading ? styles.disabled : null, style]}>
        <LinearGradient colors={[colors.gold, '#7A5810']} start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }} style={styles.base}>
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      {...props}
      disabled={disabled || loading}
      style={[styles.base, variantStyle(variant), (disabled || loading) && styles.disabled, style]}
    >
      {content}
    </TouchableOpacity>
  );
}

function variantStyle(variant: ButtonProps['variant']) {
  switch (variant) {
    case 'success':
      return { backgroundColor: colors.success };
    case 'danger':
      return { backgroundColor: colors.danger };
    case 'dangerGhost':
      return { backgroundColor: colors.dangerDim, borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)' };
    case 'ghost':
      return { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border };
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 15,
  },
});
