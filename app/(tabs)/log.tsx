import React from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput } from 'react-native';
import { useAppStore } from '@/lib/store';
import { Card, Button } from '@/components/ui';

export default function LogEntry() {
  const { categories, addLog } = useAppStore();
  const [notes, setNotes] = React.useState<Record<number, string>>({});
  const [ratings, setRatings] = React.useState<Record<number, number>>({});

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Daily Check‑in</Text>
      {categories.map((c) => (
        <Card key={c.id} title={c.name}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text>Rating (1–10)</Text>
            <Text style={{ fontWeight: '700' }}>{ratings[c.id] ?? 5}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginVertical: 8, flexWrap: 'wrap' }}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <Button key={n} variant={ratings[c.id] === n ? 'primary' : 'ghost'} onPress={() => setRatings({ ...ratings, [c.id]: n })}>{n}</Button>
            ))}
          </View>
          <TextInput
            placeholder="Quick note (optional)"
            value={notes[c.id] || ''}
            onChangeText={(t) => setNotes({ ...notes, [c.id]: t })}
            style={styles.input}
            multiline
          />
          <Button onPress={async () => { await addLog(c.id, ratings[c.id] ?? 5, notes[c.id] || null); }}>Save</Button>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, marginVertical: 8, minHeight: 60 }
});