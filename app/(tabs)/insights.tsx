import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { format, subDays } from 'date-fns';

export default function Insights() {
  const { logs, categories } = useAppStore();
  const width = Dimensions.get('window').width - 32;

  const last7 = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), 'MM/dd'));

  const dataByCat = categories.map(c => {
    const map: Record<string, number[]> = {};
    logs.filter(l => l.category_id === c.id).forEach(l => {
      const k = format(new Date(l.date + 'T00:00:00'), 'MM/dd');
      if (!map[k]) map[k] = [];
      map[k].push(l.rating);
    });
    const values = last7.map(d => {
      const arr = map[d] || [];
      return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
    });
    return { name: c.name, values };
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Insights</Text>
      {dataByCat.map((d, idx) => (
        <Card key={idx} title={d.name}>
          <LineChart
            data={{ labels: last7, datasets: [{ data: d.values }] }}
            width={width}
            height={180}
            yAxisSuffix=""
            fromZero
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(47, 149, 220, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(71, 84, 103, ${opacity})`,
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
});