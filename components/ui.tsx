import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, Modal as RNModal, TouchableOpacity } from 'react-native';

export const Card: React.FC<React.PropsWithChildren<{ title?: string; right?: React.ReactNode }>> = ({ title, right, children }) => (
  <View style={styles.card}>
    {(title || right) && (
      <View style={styles.cardHeader}>
        {title ? <Text style={styles.cardTitle}>{title}</Text> : <View />}
        {right}
      </View>
    )}
    {children}
  </View>
);

export const Button: React.FC<React.PropsWithChildren<{ 
  onPress?: () => void; 
  variant?: 'default'|'outline'|'destructive'|'ghost';
  size?: 'default'|'sm'|'lg';
  style?: any;
}>> = ({ onPress, children, variant='default', size='default', style }) => (
  <Pressable onPress={onPress} style={[
    styles.button, 
    variant==='outline' && styles.buttonOutline,
    variant==='destructive' && styles.buttonDestructive,
    variant==='ghost' && styles.buttonGhost,
    size==='sm' && styles.buttonSm,
    size==='lg' && styles.buttonLg,
    style
  ]}>
    <Text style={[
      styles.buttonText, 
      variant==='outline' && styles.buttonOutlineText,
      variant==='destructive' && styles.buttonDestructiveText,
      variant==='ghost' && styles.buttonGhostText,
      size==='sm' && styles.buttonTextSm
    ]}>{children}</Text>
  </Pressable>
);

export const Pill: React.FC<React.PropsWithChildren> = ({ children }) => (
  <View style={styles.pill}><Text style={styles.pillText}>{children}</Text></View>
);

export const Input: React.FC<{
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  style?: any;
}> = ({ label, value, onChangeText, placeholder, multiline, style }) => (
  <View style={[styles.inputContainer, style]}>
    {label && <Text style={styles.inputLabel}>{label}</Text>}
    <TextInput
      style={[styles.input, multiline && styles.inputMultiline]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
    />
  </View>
);

export const Modal: React.FC<React.PropsWithChildren<{
  visible: boolean;
  onRequestClose: () => void;
  title?: string;
}>> = ({ visible, onRequestClose, title, children }) => (
  <RNModal
    visible={visible}
    animationType="slide"
    presentationStyle="pageSheet"
    onRequestClose={onRequestClose}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{title || 'Modal'}</Text>
        <TouchableOpacity onPress={onRequestClose} style={styles.modalClose}>
          <Text style={styles.modalCloseText}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.modalContent}>
        {children}
      </View>
    </View>
  </RNModal>
);

export const Checkbox: React.FC<{
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
}> = ({ checked, onCheckedChange, label }) => (
  <TouchableOpacity 
    style={styles.checkboxContainer} 
    onPress={() => onCheckedChange(!checked)}
  >
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked && <Text style={styles.checkboxCheck}>✓</Text>}
    </View>
    {label && <Text style={styles.checkboxLabel}>{label}</Text>}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  button: {
    backgroundColor: '#2f95dc',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2f95dc'
  },
  buttonOutlineText: { color: '#2f95dc' },
  buttonDestructive: {
    backgroundColor: '#dc2626'
  },
  buttonDestructiveText: { color: '#fff' },
  buttonGhost: { backgroundColor: 'transparent' },
  buttonGhostText: { color: '#2f95dc' },
  buttonSm: {
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  buttonTextSm: { fontSize: 14 },
  buttonLg: {
    paddingVertical: 16,
    paddingHorizontal: 24
  },
  pill: { backgroundColor: '#eef6ff', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  pillText: { color: '#2f95dc', fontWeight: '600' },
  inputContainer: {
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  modalClose: {
    padding: 8
  },
  modalCloseText: {
    fontSize: 18,
    color: '#666'
  },
  modalContent: {
    flex: 1,
    padding: 16
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  checkboxChecked: {
    backgroundColor: '#2f95dc',
    borderColor: '#2f95dc'
  },
  checkboxCheck: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333'
  }
});