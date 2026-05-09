/**
 * Source Picker — PDF, URL, and Notes input component
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { NucleoIcon, NucleoIconName } from '@/components/ui/NucleoIcon';
import { Colors } from '@/constants/theme';
import type { Source } from '@/types';

interface SourcePickerProps {
  sources: Source[];
  onAddSource: (source: Source) => void;
  onRemoveSource: (sourceId: string) => void;
}

function uid(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function SourcePicker({
  sources,
  onAddSource,
  onRemoveSource,
}: SourcePickerProps) {
  const [urlInput, setUrlInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [activeTab, setActiveTab] = useState<'pdf' | 'url' | 'notes'>('pdf');

  const handlePickPDF = async () => {
    try {
      const DocumentPicker = await import('expo-document-picker');
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onAddSource({
          id: uid(),
          type: 'pdf',
          title: asset.name || 'PDF Document',
          uri: asset.uri,
          sections: [],
        });
      }
    } catch (error) {
      console.warn('PDF picker error:', error);
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    onAddSource({
      id: uid(),
      type: 'url',
      title: urlInput.replace(/^https?:\/\//, '').split('/')[0] || 'Web Link',
      uri: urlInput.trim(),
      sections: [],
    });
    setUrlInput('');
  };

  const handleAddNotes = () => {
    if (!notesInput.trim()) return;
    onAddSource({
      id: uid(),
      type: 'notes',
      title: `Notes ${sources.filter((s) => s.type === 'notes').length + 1}`,
      rawText: notesInput.trim(),
      sections: [],
    });
    setNotesInput('');
  };

  const tabConfig: Record<string, { icon: NucleoIconName; label: string }> = {
    pdf: { icon: 'book-open', label: 'PDF' },
    url: { icon: 'link', label: 'URL' },
    notes: { icon: 'dial', label: 'Notes' },
  };

  return (
    <View className="flex-1 w-full">
      {/* Tab Selector */}
      <View className="flex-row gap-sm mb-lg">
        {(['pdf', 'url', 'notes'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-md rounded-md items-center border ${
              activeTab === tab
                ? 'bg-bg-tertiary border-accent-primary'
                : 'bg-bg-secondary border-border-subtle'
            }`}
            onPress={() => setActiveTab(tab)}
          >
            <View className="flex-row items-center gap-[6px]">
              <NucleoIcon
                name={tabConfig[tab].icon}
                size={16}
              />
              <Text className={`text-sm font-medium ${activeTab === tab ? 'text-accent-primary' : 'text-text-muted'}`}>
                {tabConfig[tab].label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input Area */}
      <View className="mb-lg">
        {activeTab === 'pdf' && (
          <TouchableOpacity
            className="border-2 border-dashed border-border-medium rounded-lg py-xxxl items-center justify-center bg-bg-secondary"
            onPress={handlePickPDF}
          >
            <View className="mb-md">
              <NucleoIcon name="folder" size={40} />
            </View>
            <Text className="text-text-primary text-md font-medium">
              Tap to select a PDF file
            </Text>
            <Text className="text-text-muted text-sm mt-xs">
              {Platform.OS === 'web'
                ? 'Browse your files'
                : 'From Files, iCloud, or Downloads'}
            </Text>
          </TouchableOpacity>
        )}

        {activeTab === 'url' && (
          <View className="flex-row gap-sm">
            <TextInput
              className="flex-1 bg-bg-secondary rounded-md border border-border-subtle px-lg py-md text-text-primary text-md"
              placeholder="https://example.com/study-material"
              placeholderTextColor={Colors.text.muted}
              value={urlInput}
              onChangeText={setUrlInput}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
              selectionColor={Colors.accent.primary}
            />
            <TouchableOpacity
              className={`bg-accent-primary rounded-md px-lg py-md justify-center items-center ${!urlInput.trim() ? 'opacity-40' : ''}`}
              onPress={handleAddUrl}
              disabled={!urlInput.trim()}
            >
              <Text className="text-text-primary text-md font-semibold">Add</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'notes' && (
          <View className="gap-sm">
            <TextInput
              className="bg-bg-secondary rounded-md border border-border-subtle px-lg py-md text-text-primary text-md min-h-[120px]"
              placeholder="Paste your notes or key topics here..."
              placeholderTextColor={Colors.text.muted}
              value={notesInput}
              onChangeText={setNotesInput}
              multiline
              textAlignVertical="top"
              selectionColor={Colors.accent.primary}
            />
            <TouchableOpacity
              className={`bg-accent-primary rounded-md px-lg py-md justify-center items-center ${!notesInput.trim() ? 'opacity-40' : ''}`}
              onPress={handleAddNotes}
              disabled={!notesInput.trim()}
            >
              <Text className="text-text-primary text-md font-semibold">Add Notes</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Source List */}
      {sources.length > 0 && (
        <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
          <Text className="text-text-secondary text-sm font-medium mb-md">
            Added Sources ({sources.length})
          </Text>
          <View className="gap-md">
          {sources.map((source) => (
            <View key={source.id} className="flex-row items-center bg-bg-secondary rounded-md p-md border border-border-subtle">
              <View className="mr-md">
                <NucleoIcon
                  name={tabConfig[source.type]?.icon || 'book-open'}
                  size={20}
                />
              </View>
              <View className="flex-1">
                <Text className="text-text-primary text-md font-medium" numberOfLines={1}>
                  {source.title}
                </Text>
                <Text className="text-text-muted text-xs font-medium mt-[2px]">
                  {source.type.toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity
                className="w-[28px] h-[28px] rounded-[14px] bg-bg-tertiary items-center justify-center"
                onPress={() => onRemoveSource(source.id)}
              >
                <Text className="text-text-muted text-sm">✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
