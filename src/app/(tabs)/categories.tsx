import { StyleSheet, Text, View } from 'react-native';

export default function CategoryListScreen() {
  return (
    <View style={styles.container}>
      <Text>Categorías</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
