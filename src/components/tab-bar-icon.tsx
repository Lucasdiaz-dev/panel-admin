import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/constants/colors';

type TabBarIconProps = {
  name: SymbolViewProps['name'];
  focused: boolean;
};

export function TabBarIcon({ name, focused }: TabBarIconProps) {
  return (
    <View style={[styles.circle, focused && styles.circleActive]}>
      <SymbolView name={name} size={22} tintColor={focused ? colors.text : colors.textMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    backgroundColor: colors.surface,
  },
});
