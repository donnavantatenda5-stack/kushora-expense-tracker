import { StyleSheet, Text, View } from 'react-native';
import { firstName, useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme';

const dayPart = (hour: number): string => {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const longDate = (): string =>
  new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

/** Greets the signed-in account by the name they signed up with. */
export default function Greeting() {
  const { account } = useAuth();
  const t = useTheme();
  const who = firstName(account);
  const now = new Date();

  return (
    <View style={[styles.wrap, { backgroundColor: t.card, borderColor: t.line }]}>
      <Text style={[styles.hello, { color: t.ink }]}>
        {dayPart(now.getHours())}
        {who ? `, ${who}` : ''}
      </Text>
      <Text style={[styles.welcome, { color: t.mute }]}>
        {who ? `Welcome back, ${who}. Here is where your money stands.` : 'Here is where your money stands.'}
      </Text>
      <Text style={[styles.date, { color: t.mute }]}>{longDate()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  hello: { fontSize: 22, fontWeight: '700' },
  welcome: { fontSize: 14, marginTop: 4 },
  date: { fontSize: 13, marginTop: 8 },
});