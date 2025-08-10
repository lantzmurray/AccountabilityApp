import { Stack } from 'expo-router';
import { ScrollView, Text, StyleSheet, View } from 'react-native';

export default function ModalScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'About' }} />
      <ScrollView style={{ padding: 16 }}>
        <Text style={styles.title}>Accountability & Relationship Tracker</Text>
        <Text style={styles.description}>
          Track daily behaviors across key relationship areas, journal reflections, log time on activities, and review weekly insights. Use the Log tab daily, track focused work in Activities, review Insights regularly, and adjust categories in Settings.
        </Text>
        
        <View style={styles.versesSection}>
          <Text style={styles.versesTitle}>Biblical Foundation</Text>
          <Text style={styles.versesSubtitle}>Relationships & Marriage</Text>
          
          <View style={styles.verseContainer}>
            <Text style={styles.verseText}>
              "Above all else, guard your heart, for everything you do flows from it."
            </Text>
            <Text style={styles.verseReference}>- Proverbs 4:23</Text>
          </View>
          
          <View style={styles.verseContainer}>
            <Text style={styles.verseText}>
              "Two are better than one, because they have a good return for their labor: If either of them falls down, one can help the other up."
            </Text>
            <Text style={styles.verseReference}>- Ecclesiastes 4:9-10</Text>
          </View>
          
          <View style={styles.verseContainer}>
            <Text style={styles.verseText}>
              "Be completely humble and gentle; be patient, bearing with one another in love."
            </Text>
            <Text style={styles.verseReference}>- Ephesians 4:2</Text>
          </View>
          
          <View style={styles.verseContainer}>
            <Text style={styles.verseText}>
              "Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs."
            </Text>
            <Text style={styles.verseReference}>- 1 Corinthians 13:4-5</Text>
          </View>
          
          <View style={styles.verseContainer}>
            <Text style={styles.verseText}>
              "Husbands, love your wives as Christ loved the church and gave himself up for her."
            </Text>
            <Text style={styles.verseReference}>- Ephesians 5:25</Text>
          </View>
          
          <View style={styles.verseContainer}>
            <Text style={styles.verseText}>
              "Therefore what God has joined together, let no one separate."
            </Text>
            <Text style={styles.verseReference}>- Mark 10:9</Text>
          </View>
          
          <View style={styles.verseContainer}>
            <Text style={styles.verseText}>
              "A gentle answer turns away wrath, but a harsh word stirs up anger."
            </Text>
            <Text style={styles.verseReference}>- Proverbs 15:1</Text>
          </View>
          
          <View style={styles.verseContainer}>
            <Text style={styles.verseText}>
              "Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you."
            </Text>
            <Text style={styles.verseReference}>- Ephesians 4:32</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    color: '#475467',
    marginBottom: 24,
  },
  versesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  versesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1f2937',
  },
  versesSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  verseContainer: {
    marginBottom: 16,
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
