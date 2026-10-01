import { useState, type ComponentProps } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';
import { radius, useTheme } from '../../theme';

// react-native types autoComplete as a large string union with no exported alias.
type AutoComplete = ComponentProps<typeof TextInput>['autoComplete'];

export default function Input({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  keyboardType,
  maxLength,
  autoCapitalize = 'none',
  returnKeyType,
  onSubmitEditing,
  autoFocus,
  secureTextEntry,
  autoComplete,
  autoCorrect,
}: {
  label: string;
  value: string;
  onChangeText: (next: string) => void;
  error?: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  returnKeyType?: 'done' | 'search' | 'next' | 'go' | 'send';
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
  secureTextEntry?: boolean;
  autoComplete?: AutoComplete;
  autoCorrect?: boolean;
}) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: t.mute }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.mute}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect ?? false}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        autoFocus={autoFocus}
        secureTextEntry={secureTextEntry}
        autoComplete={autoComplete}
        selectionColor={t.inc}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          {
            backgroundColor: t.card,
            color: t.ink,
            borderColor: error ? t.exp : focused ? t.inc : t.line,
          },
        ]}
      />
      {error ? <Text style={[styles.error, { color: t.exp }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 12 },
  label: { fontSize: 14, marginBottom: 4 },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  error: { fontSize: 13, marginTop: 4 },
});
