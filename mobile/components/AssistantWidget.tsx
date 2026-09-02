import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  View
} from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  FAB,
  IconButton,
  Surface,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import api from '../utils/api';
import i18n from '../i18n/i18n';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AssistantWidget() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const isAdmin = user?.role?.code === 'ADMIN' || user?.role?.code === 'LIMITED_ADMIN';
  if (!isAdmin) return null;

  const isSpanish = i18n.language === 'es';

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: isSpanish
          ? '¡Hola! Soy tu asistente de mantenimiento de Bay Baby Produce. ¿En qué puedo ayudarte hoy?'
          : 'Hello! I\'m your Bay Baby Produce maintenance assistant. How can I help you today?'
      }
    ]);
  }, [isSpanish]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);
    try {
      const history = newMessages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const result = await api.post<{ response: string }>('assistant/chat', {
        message: text,
        history,
        language: isSpanish ? 'es' : 'en'
      });
      const reply: Message = { role: 'assistant', content: result.response };
      setMessages((prev) => [...prev, reply]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: isSpanish ? 'Lo siento, ocurrió un error.' : 'Sorry, an error occurred.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser ? styles.userRow : styles.assistantRow]}>
        {!isUser && (
          <Avatar.Icon
            size={28}
            icon="robot-outline"
            style={{ backgroundColor: theme.colors.primary, marginRight: 6 }}
          />
        )}
        <Surface
          style={[
            styles.bubble,
            { backgroundColor: isUser ? theme.colors.primaryContainer : theme.colors.surface }
          ]}
          elevation={1}
        >
          <Text style={{ color: isUser ? theme.colors.onPrimaryContainer : theme.colors.onSurface }}>
            {item.content}
          </Text>
        </Surface>
      </View>
    );
  };

  return (
    <>
      <FAB
        icon="robot-outline"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => setOpen(true)}
      />
      <Modal visible={open} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.chatBox, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
              <Avatar.Icon size={32} icon="robot-outline" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <Text variant="titleMedium" style={{ color: 'white', marginLeft: 8, flex: 1 }}>
                {t('ai_assistant')}
              </Text>
              <IconButton icon="close" iconColor="white" onPress={() => { setOpen(false); }} />
            </View>

            {/* Messages */}
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(_, i) => String(i)}
              renderItem={renderMessage}
              contentContainerStyle={{ padding: 8 }}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {loading && (
              <View style={{ padding: 8, alignItems: 'flex-start' }}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            )}

            {/* Input */}
            <View style={[styles.inputRow, { borderTopColor: theme.colors.secondary + '44' }]}>
              <TextInput
                mode="outlined"
                value={input}
                onChangeText={setInput}
                placeholder={t('type_message')}
                style={{ flex: 1, maxHeight: 100 }}
                multiline
                disabled={loading}
                onSubmitEditing={sendMessage}
                blurOnSubmit
              />
              <IconButton
                icon="send"
                iconColor={theme.colors.primary}
                size={28}
                onPress={sendMessage}
                disabled={loading || !input.trim()}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: { position: 'absolute', right: 16, bottom: 80, zIndex: 100 },
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  chatBox: { height: '75%', borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  msgRow: { flexDirection: 'row', marginVertical: 4 },
  userRow: { justifyContent: 'flex-end' },
  assistantRow: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', padding: 10, borderRadius: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, padding: 4 }
});
