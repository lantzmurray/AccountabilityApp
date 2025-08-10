import React from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput } from 'react-native';
import { useAppStore } from '@/lib/store';
import { Card, Button } from '@/components/ui';

export default function Journal() {
  const { journal, addJournal } = useAppStore();
  const [text, setText] = React.useState('');

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Journal</Text>
      <Card title="New Entry">
        <TextInput value={text} onChangeText={setText} multiline placeholder="Write a reflection..." style={styles.input} />
        <Button onPress={async () => { await addJournal(text); setText(''); }}>Save Entry</Button>
      </Card>
      {journal.map(j => (
        <Card key={j.id}>
          <Text style={{ fontWeight: '600', marginBottom: 6 }}>{j.date}</Text>
          <Text style={{ color: '#334155' }}>{j.text}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, marginVertical: 8, minHeight: 80 }
});