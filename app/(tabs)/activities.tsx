import React from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { useAppStore } from '@/lib/store';
import { Card, Button, Pill } from '@/components/ui';

export default function ActivitiesScreen() {
  const { activities, timeEntries, activeTimeEntries, addActivity, startTimer, stopTimer, addTimeEntry } = useAppStore();
  const [newActivity, setNewActivity] = React.useState('');
  const [quickMinutes, setQuickMinutes] = React.useState<Record<number, string>>({});
  const [notes, setNotes] = React.useState<Record<number, string>>({});

  const activeByActivity = React.useMemo(() => {
    const map = new Map<number, number[]>();
    activeTimeEntries.forEach(te => {
      if (!map.has(te.activity_id)) map.set(te.activity_id, []);
      map.get(te.activity_id)!.push(te.id);
    });
    return map;
  }, [activeTimeEntries]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Activities & Timers</Text>

      <Card title="Add Activity">
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput placeholder="New activity name" value={newActivity} onChangeText={setNewActivity} style={[styles.input, { flex: 1 }]} />
          <Button onPress={async () => { if (!newActivity.trim()) return; await addActivity(newActivity.trim()); setNewActivity(''); }}>Add</Button>
        </View>
      </Card>

      {activities.map(a => (
        <Card key={a.id} title={a.name} right={activeByActivity.get(a.id)?.length ? <Pill>{activeByActivity.get(a.id)!.length} running</Pill> : undefined}>
          <Text style={{ color: '#667085', marginBottom: 8 }}>{a.description || 'No description'}</Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <Button onPress={() => startTimer(a.id)}>Start Timer</Button>
            {activeByActivity.get(a.id)?.map(id => (
              <Button key={id} variant="ghost" onPress={() => stopTimer(id)}>Stop #{id}</Button>
            ))}
          </View>
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: '600' }}>Quick add</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {[15, 25, 30, 45, 60, 90].map(m => (
                <Button key={m} variant="ghost" onPress={() => addTimeEntry(a.id, m)}>+{m}m</Button>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <TextInput
                placeholder="Custom minutes"
                keyboardType="numeric"
                value={quickMinutes[a.id] || ''}
                onChangeText={t => setQuickMinutes({ ...quickMinutes, [a.id]: t })}
                style={[styles.input, { width: 120 }]} />
              <TextInput
                placeholder="Note (optional)"
                value={notes[a.id] || ''}
                onChangeText={t => setNotes({ ...notes, [a.id]: t })}
                style={[styles.input, { flex: 1 }]} />
              <Button onPress={async () => {
                const mins = parseInt(quickMinutes[a.id] || '0', 10);
                if (!mins || mins <= 0) { Alert.alert('Please enter minutes'); return; }
                await addTimeEntry(a.id, mins, notes[a.id] || null);
                setQuickMinutes({ ...quickMinutes, [a.id]: '' });
                setNotes({ ...notes, [a.id]: '' });
              }}>Add</Button>
            </View>
          </View>
        </Card>
      ))}

      <Card title="Recent Time Entries">
        {timeEntries.length === 0 && <Text style={{ color: '#667085' }}>No time entries yet.</Text>}
        {timeEntries.map(te => (
          <View key={te.id} style={styles.row}>
            <Text style={{ flex: 1 }}>#{te.id} • Activity {te.activity_id}</Text>
            <Text style={{ width: 120, textAlign: 'right' }}>{te.duration_minutes ?? '—'} min</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, marginVertical: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }
});