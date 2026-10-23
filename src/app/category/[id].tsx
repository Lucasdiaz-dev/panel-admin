import { StyleSheet, Text, View } from 'react-native';

export default function CategoryProductsScreen() {
  return (
    <View style={styles.container}>
      <Text>Productos de la categoría</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
