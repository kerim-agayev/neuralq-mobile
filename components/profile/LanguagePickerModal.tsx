import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../theme';
import { LANGUAGES, Language } from '../../constants/languages';

interface LanguagePickerModalProps {
  visible: boolean;
  selectedLanguage: string;
  onSelect: (lang: string) => void;
  onClose: () => void;
}

export default function LanguagePickerModal({
  visible,
  selectedLanguage,
  onSelect,
  onClose,
}: LanguagePickerModalProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return LANGUAGES;
    const q = search.toLowerCase();
    return LANGUAGES.filter(
      (l) =>
        l.label.toLowerCase().includes(q) ||
        l.value.toLowerCase().includes(q),
    );
  }, [search]);

  const handleSelect = (lang: Language) => {
    onSelect(lang.value);
    setSearch('');
  };

  const handleClose = () => {
    setSearch('');
    onClose();
  };

  const renderItem = ({ item }: { item: Language }) => {
    const isSelected = item.value === selectedLanguage;
    return (
      <TouchableOpacity
        style={[
          styles.item,
          {
            backgroundColor: isSelected ? colors.primaryDim : colors.surface,
            borderColor: isSelected ? colors.primary : colors.border,
          },
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.flag}>{item.flag}</Text>
        <Text
          style={[
            styles.label,
            { color: isSelected ? colors.primary : colors.text },
          ]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
        {isSelected && <Text style={styles.check}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              maxHeight: height * 0.7,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              🌐 Select Language
            </Text>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
              <Text style={[styles.closeBtn, { color: colors.textSecondary }]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View
            style={[
              styles.searchWrap,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search..."
              placeholderTextColor={colors.textDim}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          {/* List */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.value}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    fontSize: 20,
    fontWeight: '600',
    padding: 4,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  flag: {
    fontSize: 22,
    marginRight: 12,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  check: {
    fontSize: 18,
    color: '#00FF88',
    fontWeight: '700',
  },
});
