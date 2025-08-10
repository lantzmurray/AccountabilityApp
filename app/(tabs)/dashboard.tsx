import React, { useMemo } from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { useAppStore } from '@/lib/store';
import { Card, Pill } from '@/components/ui';

export default function Dashboard() {
  const { categories, logs, streaks, ready } = useAppStore();

  const health = useMemo(() => {
    if (!categories.length) return 0;
    const weights = categories.map(c => c.weight);
    const totalWeight = weights.reduce((a,b)=>a+b,0) || 1;
    const byCat = new Map<number, number[]>();
    logs.forEach(l => {
      if (!byCat.has(l.category_id)) byCat.set(l.category_id, []);
      byCat.get(l.category_id)!.push(l.rating);
    });
    let sum = 0;
    categories.forEach(c => {
      const arr = byCat.get(c.id) || [];
      const avg = arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
      sum += (avg/10) * c.weight;
    });
    return Math.round((sum / totalWeight) * 100);
  }, [categories, logs]);

  const recentActivity = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(l => l.date === today);
    return todayLogs.length;
  }, [logs]);

  const totalEntries = logs.length;

  const catName = (id: number) => categories.find(c => c.id === id)?.name || `#${id}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Dashboard</Text>
      
      <Card title="Activity Overview">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.bigScore}>{recentActivity}</Text>
            <Text style={{ color: '#667085' }}>Today's Entries</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.bigScore}>{totalEntries}</Text>
            <Text style={{ color: '#667085' }}>Total Entries</Text>
          </View>
        </View>
      </Card>

      <Card title="Relationship Health Score">
        <Text style={styles.bigScore}>{health}</Text>
        <Text style={{ color: '#667085' }}>/ 100 (weighted)</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {streaks.map(s => (
            <Pill key={s.category_id}>{catName(s.category_id)}: {s.current}d (best {s.best}d)</Pill>
          ))}
        </View>
      </Card>

      <Card title="Quick Stats">
        <View style={{ gap: 8 }}>
          {categories.map(cat => {
            const catLogs = logs.filter(l => l.category_id === cat.id);
            const avgRating = catLogs.length ? (catLogs.reduce((sum, l) => sum + l.rating, 0) / catLogs.length).toFixed(1) : '0.0';
            return (
              <View key={cat.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontWeight: '600' }}>{cat.name}</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Text style={{ color: '#667085' }}>{catLogs.length} entries</Text>
                  <Text style={{ color: '#667085' }}>avg {avgRating}/10</Text>
                </View>
              </View>
            );
          })}
        </View>
      </Card>

      <Card title="Biblical Foundation">
        <Text style={{ fontSize: 14, color: '#667085', marginBottom: 12 }}>Relationships & Marriage</Text>
        
        <View style={styles.verseContainer}>
          <Text style={styles.verseText}>
            "Above all else, guard your heart, for everything you do flows from it."
          </Text>
          <Text style={styles.verseReference}>- Proverbs 4:23</Text>
        </View>
        
        <View style={styles.verseContainer}>
          <Text style={styles.verseText}>
            "Love is patient, love is kind. It does not envy, it does not boast, it is not proud."
          </Text>
          <Text style={styles.verseReference}>- 1 Corinthians 13:4</Text>
        </View>
        
        <View style={styles.verseContainer}>
          <Text style={styles.verseText}>
            "Be completely humble and gentle; be patient, bearing with one another in love."
          </Text>
          <Text style={styles.verseReference}>- Ephesians 4:2</Text>
        </View>
        
        <View style={styles.verseContainer}>
          <Text style={styles.verseText}>
            "A gentle answer turns away wrath, but a harsh word stirs up anger."
          </Text>
          <Text style={styles.verseReference}>- Proverbs 15:1</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  bigScore: { fontSize: 48, fontWeight: '800', color: '#111827' },
  verseContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  verseText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  verseReference: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'right',
  },
});