/**
 * Source Picker — PDF, URL, and Notes input component
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Platform,
} from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
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

  const typeIcons: Record<string, string> = {
    pdf: '📄',
    url: '🔗',
    notes: '📝',
  };

  return (
    <View style={styles.container}>
      {/* Tab Selector */}
      <View style={styles.tabs}>
        {(['pdf', 'url', 'notes'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'pdf' ? '📄 PDF' : tab === 'url' ? '🔗 URL' : '📝 Notes'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input Area */}
      <View style={styles.inputArea}>
        {activeTab === 'pdf' && (
          <TouchableOpacity style={styles.uploadBtn} onPress={handlePickPDF}>
            <Text style={styles.uploadIcon}>📁</Text>
            <Text style={styles.uploadText}>Tap to select a PDF file</Text>
            <Text style={styles.uploadHint}>
              {Platform.OS === 'web'
                ? 'Browse your files'
                : 'From Files, iCloud, or Downloads'}
            </Text>
          </TouchableOpacity>
        )}

        {activeTab === 'url' && (
          <View style={styles.urlContainer}>
            <TextInput
              style={styles.textInput}
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
              style={[styles.addBtn, !urlInput.trim() && styles.addBtnDisabled]}
              onPress={handleAddUrl}
              disabled={!urlInput.trim()}
            >
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'notes' && (
          <View style={styles.notesContainer}>
            <TextInput
              style={[styles.textInput, styles.notesInput]}
              placeholder="Paste your notes or key topics here..."
              placeholderTextColor={Colors.text.muted}
              value={notesInput}
              onChangeText={setNotesInput}
              multiline
              textAlignVertical="top"
              selectionColor={Colors.accent.primary}
            />
            <TouchableOpacity
              style={[styles.addBtn, !notesInput.trim() && styles.addBtnDisabled]}
              onPress={handleAddNotes}
              disabled={!notesInput.trim()}
            >
              <Text style={styles.addBtnText}>Add Notes</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Source List */}
      {sources.length > 0 && (
        <ScrollView style={styles.sourceList} showsVerticalScrollIndicator={false}>
          <Text style={styles.sourcesTitle}>
            Added Sources ({sources.length})
          </Text>
          {sources.map((source) => (
            <View key={source.id} style={styles.sourceItem}>
              <Text style={styles.sourceIcon}>{typeIcons[source.type]}</Text>
              <View style={styles.sourceInfo}>
                <Text style={styles.sourceName} numberOfLines={1}>
                  {source.title}
                </Text>
                <Text style={styles.sourceType}>
                  {source.type.toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => onRemoveSource(source.id)}
              >
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  tabs: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bg.secondary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  activeTab: {
    backgroundColor: Colors.bg.tertiary,
    borderColor: Colors.accent.primary,
  },
  tabText: {
    color: Colors.text.muted,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  activeTabText: {
    color: Colors.accent.primary,
  },
  inputArea: {
    marginBottom: Spacing.lg,
  },
  uploadBtn: {
    borderWidth: 2,
    borderColor: Colors.border.medium,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg.secondary,
  },
  uploadIcon: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  uploadText: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  uploadHint: {
    color: Colors.text.muted,
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
  urlContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    color: Colors.text.primary,
    fontSize: FontSize.md,
  },
  notesContainer: {
    gap: Spacing.sm,
  },
  notesInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
  },
  addBtn: {
    backgroundColor: Colors.accent.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  addBtnText: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  sourceList: {
    maxHeight: 200,
  },
  sourcesTitle: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.sm,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  sourceIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  sourceType: {
    color: Colors.text.muted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.bg.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: Colors.text.muted,
    fontSize: FontSize.sm,
  },
});
