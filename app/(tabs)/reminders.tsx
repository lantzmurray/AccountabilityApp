import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { format } from 'date-fns';
import { Text, View } from '@/components/Themed';
import { Button, Card, Input, Modal, Checkbox } from '@/components/ui';
import { useAppStore } from '@/lib/store';
import { Reminder } from '@/lib/db';

export default function RemindersScreen() {
  const { reminders, categories, activities, addReminder, completeReminder, removeReminder } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newDueTime, setNewDueTime] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const handleAddReminder = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    try {
      await addReminder(
        newTitle.trim(),
        newDescription.trim() || null,
        newDueDate,
        newDueTime.trim() || null,
        selectedCategoryId,
        selectedActivityId
      );
      
      // Reset form
      setNewTitle('');
      setNewDescription('');
      setNewDueDate(format(new Date(), 'yyyy-MM-dd'));
      setNewDueTime('');
      setSelectedCategoryId(null);
      setSelectedActivityId(null);
      setShowAddModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add reminder');
    }
  };

  const handleCompleteReminder = async (id: number) => {
    try {
      await completeReminder(id);
    } catch (error) {
      Alert.alert('Error', 'Failed to complete reminder');
    }
  };

  const handleDeleteReminder = async (id: number) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeReminder(id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete reminder');
            }
          }
        }
      ]
    );
  };

  const filteredReminders = reminders.filter(reminder => 
    showCompleted ? reminder.completed : !reminder.completed
  );

  const overdue = reminders.filter(reminder => {
    if (reminder.completed) return false;
    const today = format(new Date(), 'yyyy-MM-dd');
    const now = format(new Date(), 'HH:mm');
    return reminder.due_date < today || 
           (reminder.due_date === today && reminder.due_time && reminder.due_time < now);
  });

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return null;
    const category = categories.find(c => c.id === categoryId);
    return category?.name;
  };

  const getActivityName = (activityId: number | null) => {
    if (!activityId) return null;
    const activity = activities.find(a => a.id === activityId);
    return activity?.name;
  };

  const formatDueDate = (reminder: Reminder) => {
    const date = new Date(reminder.due_date + 'T00:00:00');
    let formatted = format(date, 'MMM d, yyyy');
    if (reminder.due_time) {
      formatted += ` at ${reminder.due_time}`;
    }
    return formatted;
  };

  const isOverdue = (reminder: Reminder) => {
    if (reminder.completed) return false;
    const today = format(new Date(), 'yyyy-MM-dd');
    const now = format(new Date(), 'HH:mm');
    return reminder.due_date < today || 
           (reminder.due_date === today && reminder.due_time && reminder.due_time < now);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reminders</Text>
        <Button onPress={() => setShowAddModal(true)}>Add Reminder</Button>
      </View>

      {overdue.length > 0 && (
        <Card style={[styles.card, styles.overdueCard]}>
          <Text style={styles.overdueTitle}>⚠️ Overdue ({overdue.length})</Text>
          {overdue.slice(0, 3).map(reminder => (
            <Text key={reminder.id} style={styles.overdueItem}>
              {reminder.title}
            </Text>
          ))}
          {overdue.length > 3 && (
            <Text style={styles.overdueMore}>+{overdue.length - 3} more</Text>
          )}
        </Card>
      )}

      <View style={styles.toggleContainer}>
        <Checkbox
          checked={showCompleted}
          onCheckedChange={setShowCompleted}
          label="Show completed"
        />
      </View>

      <ScrollView style={styles.scrollView}>
        {filteredReminders.length === 0 ? (
          <Card style={styles.card}>
            <Text style={styles.emptyText}>
              {showCompleted ? 'No completed reminders' : 'No pending reminders'}
            </Text>
          </Card>
        ) : (
          filteredReminders.map(reminder => (
            <Card key={reminder.id} style={[
              styles.card,
              reminder.completed && styles.completedCard,
              isOverdue(reminder) && styles.overdueReminderCard
            ]}>
              <View style={styles.reminderHeader}>
                <Text style={[
                  styles.reminderTitle,
                  reminder.completed && styles.completedText
                ]}>
                  {reminder.title}
                </Text>
                <View style={styles.reminderActions}>
                  {!reminder.completed && (
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={() => handleCompleteReminder(reminder.id)}
                    >
                      Complete
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onPress={() => handleDeleteReminder(reminder.id)}
                  >
                    Delete
                  </Button>
                </View>
              </View>
              
              {reminder.description && (
                <Text style={[
                  styles.reminderDescription,
                  reminder.completed && styles.completedText
                ]}>
                  {reminder.description}
                </Text>
              )}
              
              <Text style={[
                styles.reminderDue,
                isOverdue(reminder) && styles.overdueText,
                reminder.completed && styles.completedText
              ]}>
                Due: {formatDueDate(reminder)}
              </Text>
              
              <View style={styles.reminderTags}>
                {getCategoryName(reminder.category_id) && (
                  <Text style={styles.tag}>📂 {getCategoryName(reminder.category_id)}</Text>
                )}
                {getActivityName(reminder.activity_id) && (
                  <Text style={styles.tag}>⚡ {getActivityName(reminder.activity_id)}</Text>
                )}
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        onRequestClose={() => setShowAddModal(false)}
        title="Add Reminder"
      >
        <View style={styles.modalContent}>
          <Input
            label="Title *"
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="Enter reminder title"
          />
          
          <Input
            label="Description"
            value={newDescription}
            onChangeText={setNewDescription}
            placeholder="Enter description (optional)"
            multiline
          />
          
          <Input
            label="Due Date *"
            value={newDueDate}
            onChangeText={setNewDueDate}
            placeholder="YYYY-MM-DD"
          />
          
          <Input
            label="Due Time"
            value={newDueTime}
            onChangeText={setNewDueTime}
            placeholder="HH:MM (optional)"
          />
          
          <Text style={styles.sectionLabel}>Category (optional)</Text>
          <ScrollView horizontal style={styles.categoryScroll}>
            <Button
              size="sm"
              variant={selectedCategoryId === null ? "default" : "outline"}
              onPress={() => setSelectedCategoryId(null)}
            >
              None
            </Button>
            {categories.map(category => (
              <Button
                key={category.id}
                size="sm"
                variant={selectedCategoryId === category.id ? "default" : "outline"}
                onPress={() => setSelectedCategoryId(category.id)}
                style={styles.categoryButton}
              >
                {category.name}
              </Button>
            ))}
          </ScrollView>
          
          <Text style={styles.sectionLabel}>Activity (optional)</Text>
          <ScrollView horizontal style={styles.categoryScroll}>
            <Button
              size="sm"
              variant={selectedActivityId === null ? "default" : "outline"}
              onPress={() => setSelectedActivityId(null)}
            >
              None
            </Button>
            {activities.map(activity => (
              <Button
                key={activity.id}
                size="sm"
                variant={selectedActivityId === activity.id ? "default" : "outline"}
                onPress={() => setSelectedActivityId(activity.id)}
                style={styles.categoryButton}
              >
                {activity.name}
              </Button>
            ))}
          </ScrollView>
          
          <View style={styles.modalActions}>
            <Button
              variant="outline"
              onPress={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button onPress={handleAddReminder}>
              Add Reminder
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  overdueCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
  },
  overdueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  overdueItem: {
    color: '#dc2626',
    marginBottom: 4,
  },
  overdueMore: {
    color: '#dc2626',
    fontStyle: 'italic',
  },
  toggleContainer: {
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  completedCard: {
    opacity: 0.7,
  },
  overdueReminderCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  reminderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  reminderDescription: {
    marginBottom: 8,
    color: '#666',
  },
  reminderDue: {
    fontSize: 14,
    marginBottom: 8,
  },
  overdueText: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  reminderTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    fontSize: 12,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalContent: {
    gap: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryButton: {
    marginRight: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
});