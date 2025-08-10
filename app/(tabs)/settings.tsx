import React from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { useAppStore } from '@/lib/store';
import { Card, Button } from '@/components/ui';
import { categoryRepo, exportAll, importAll } from '@/lib/db';
import * as FileSystem from 'expo-file-system';

export default function Settings() {
  const { categories, refreshAll, addCategory } = useAppStore();
  const [newCat, setNewCat] = React.useState('');

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Settings</Text>

      <Card title="Categories">
        {categories.map(c => (
          <View key={c.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text>{c.name}</Text>
            <Text style={{ color: '#667085' }}>weight {c.weight}</Text>
          </View>
        ))}
        <TextInput placeholder="New category" value={newCat} onChangeText={setNewCat} style={styles.input} />
        <Button onPress={async()=> { await addCategory(newCat); setNewCat(''); }}>Add</Button>
      </Card>

      <Card title="Data">
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Button onPress={async() => {
            const data = await exportAll();
            const path = FileSystem.documentDirectory + 'accountability_export.json';
            await FileSystem.writeAsStringAsync(path, JSON.stringify(data, null, 2));
            Alert.alert('Exported', path);
          }}>Export</Button>
          <Button onPress={async() => {
            try {
              const path = FileSystem.documentDirectory + 'accountability_export.json';
              const text = await FileSystem.readAsStringAsync(path);
              const data = JSON.parse(text);
              await importAll(data);
              await refreshAll();
              Alert.alert('Imported');
            } catch (e) {
              Alert.alert('Import failed', String(e));
            }
          }}>Import</Button>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, marginVertical: 8 }
});