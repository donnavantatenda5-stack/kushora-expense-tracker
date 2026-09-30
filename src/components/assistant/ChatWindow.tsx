import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { radius, useTheme } from '../../theme';
import useExpenses from '../../hooks/useExpenses';
import { askAssistant } from '../../services/aiService';
import type { ChatMessage } from '../../types';

const SUGGESTIONS = [
  'How much did I spend this month?',
  'What category do I spend the most on?',
  'What is my current balance?',
  'What were my biggest expenses?',
  'Compare my income and expenses this month',
  'How do I add an expense?',
  'How can I cut spending?',
];

const NO_ANSWER =
  "I can't answer that from your saved transactions. Try asking about spending, income, balance, a category, or how to use the app.";

export default function ChatWindow() {
  const { chat, setChat, transactions, currency, fmt } = useExpenses();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scroller = useRef<ScrollView>(null);

  const ask = async (raw: string, base: ChatMessage[] = chat) => {
    const question = raw.trim();
    if (!question || busy) return;
    setInput('');
    setBusy(true);
    setChat([...base, { role: 'user', content: question }]);
    try {
      const history = base.filter((m) => !m.bad).map(({ role, content }) => ({ role, content }));
      const r = await askAssistant({ question, history, transactions, currency, fmt });
      setChat((c) => [...c, { role: 'assistant', content: r.text, note: r.note }]);
    } catch {
      setChat((c) => [...c, { role: 'assistant', bad: true, question, base, content: NO_ANSWER }]);
    }
    setBusy(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={scroller}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: false })}
      >
        <Card small>
          Answers use your saved transactions. AI responses can be imperfect and are not
          professional financial advice.
        </Card>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {SUGGESTIONS.map((q) => (
            <Pressable
              key={q}
              onPress={() => ask(q)}
              accessibilityRole="button"
              style={[styles.chip, { borderColor: theme.line, backgroundColor: theme.card }]}
            >
              <Text style={[styles.chipText, { color: theme.ink }]}>{q}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {chat.map((m, i) => (
          <View key={i}>
            <View
              style={[
                styles.msg,
                m.role === 'user'
                  ? styles.msgRight
                  : { borderColor: m.bad ? theme.exp : theme.line },
                m.role === 'user'
                  ? { backgroundColor: theme.ink }
                  : { backgroundColor: theme.card },
              ]}
            >
              <Text selectable style={[styles.msgText, { color: m.role === 'user' ? theme.bg : theme.ink }]}>
                {m.content}
              </Text>
              {m.note ? <Text style={[styles.note, { color: theme.mute }]}>{m.note}</Text> : null}
            </View>
            {m.bad ? (
              <Pressable
                onPress={() => ask(m.question ?? '', m.base ?? [])}
                accessibilityRole="button"
                style={[styles.chip, { borderColor: theme.line, backgroundColor: theme.card }]}
              >
                <Text style={[styles.chipText, { color: theme.ink }]}>Try again</Text>
              </Pressable>
            ) : null}
          </View>
        ))}

        {busy ? (
          <View style={[styles.msg, styles.msgLeft, { backgroundColor: theme.card, borderColor: theme.line }]}>
            <Text style={[styles.msgText, { color: theme.ink }]}>Thinking...</Text>
          </View>
        ) : null}

        {chat.length ? (
          <Pressable
            onPress={() => setChat([])}
            accessibilityRole="button"
            style={[styles.chip, { borderColor: theme.line, backgroundColor: theme.card }]}
          >
            <Text style={[styles.chipText, { color: theme.ink }]}>Clear conversation</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <View style={[styles.composer, { borderTopColor: theme.line, backgroundColor: theme.bg }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your money or the app"
          placeholderTextColor={theme.mute}
          style={[styles.input, { backgroundColor: theme.card, color: theme.ink, borderColor: theme.line }]}
          onSubmitEditing={() => ask(input)}
          returnKeyType="send"
          accessibilityLabel="Question"
        />
        <Button label="Send" onPress={() => ask(input)} />
      </View>
      <View style={{ height: insets.bottom }} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 12 },
  chips: { gap: 6, paddingVertical: 2, paddingBottom: 10 },
  chip: {
    minHeight: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 13,
    justifyContent: 'center',
    marginBottom: 4,
  },
  chipText: { fontSize: 13 },
  msg: {
    maxWidth: '88%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 7,
  },
  msgLeft: { alignSelf: 'flex-start' },
  msgRight: { alignSelf: 'flex-end' },
  msgText: { fontSize: 15 },
  note: { fontSize: 11, marginTop: 5 },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    fontSize: 15,
  },
});
