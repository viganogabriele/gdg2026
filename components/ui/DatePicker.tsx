import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface DatePickerProps {
  label?: string;
  value: Date;
  minimumDate?: Date;
  onChange: (date: Date) => void;
}

function formatDate(date: Date) {
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function DatePicker({ label, value, minimumDate, onChange }: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const onNativeChange = (_: unknown, selected?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) onChange(selected);
  };

  return (
    <View>
      {label && (
        <Text className="text-text-secondary text-sm font-medium mb-sm">{label}</Text>
      )}

      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className="flex-row items-center justify-between bg-bg-secondary border border-border-subtle rounded-md px-lg py-md"
      >
        <Text className="text-text-primary text-md">{formatDate(value)}</Text>
        <Ionicons name="calendar-outline" size={20} color={Colors.text.secondary} />
      </TouchableOpacity>

      {Platform.OS === 'ios' ? (
        <Modal transparent animationType="slide" visible={showPicker}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
            activeOpacity={1}
            onPress={() => setShowPicker(false)}
          />
          <View style={{ backgroundColor: Colors.bg.secondary, paddingBottom: 32 }}>
            <TouchableOpacity
              onPress={() => setShowPicker(false)}
              style={{ alignSelf: 'flex-end', padding: 16 }}
            >
              <Text style={{ color: Colors.accent.primary, fontSize: 16, fontWeight: '600' }}>Done</Text>
            </TouchableOpacity>
            <DateTimePicker
              value={value}
              mode="date"
              display="spinner"
              minimumDate={minimumDate}
              onChange={onNativeChange}
              themeVariant="dark"
            />
          </View>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={value}
            mode="date"
            display="default"
            minimumDate={minimumDate}
            onChange={onNativeChange}
          />
        )
      )}
    </View>
  );
}
