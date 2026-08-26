import { Text, type TextProps } from 'react-native';

import { fonts } from '@/ui/theme';

// includeFontPadding: false drops Android's extra top/bottom glyph padding,
// which otherwise combines with a tight lineHeight to clip tall digits —
// callers still need a lineHeight of ~1.25x their fontSize on top of this.
export function MoneyText({ style, ...props }: TextProps) {
  return (
    <Text
      {...props}
      style={[{ fontFamily: fonts.extraBold, writingDirection: 'ltr', includeFontPadding: false }, style]}
    />
  );
}
