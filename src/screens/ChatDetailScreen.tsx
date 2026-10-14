import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { initialMessages, ChatMessage, PRIMARY } from '../data/mockData';
import Avatar from '../components/Avatar';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatDetail'>;

function getCurrentTime(): string {
  const now = new Date();
  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function ChatDetailScreen({ route }: Props) {
  const { id, name } = route.params;

  // Lấy danh sách tin nhắn mẫu tương ứng hoặc tin nhắn khởi tạo
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialMessages[id]) {
      return initialMessages[id];
    }
    return [
      {
        id: `m_welcome_${id}`,
        conversationId: id,
        text: `Xin chào! Tôi là ${name}. Rất vui được kết nối với bạn qua UDU Chat!`,
        time: '10:00',
        me: false,
      },
    ];
  });

  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (replyTimer.current) {
        clearTimeout(replyTimer.current);
      }
    };
  }, []);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const timeStr = getCurrentTime();

    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      conversationId: id,
      text,
      time: timeStr,
      me: true,
    };

    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Tự động phản hồi sau 1 giây
    if (replyTimer.current) {
      clearTimeout(replyTimer.current);
    }
    replyTimer.current = setTimeout(() => {
      const autoReply: ChatMessage = {
        id: `m_reply_${Date.now()}`,
        conversationId: id,
        text: `Cảm ơn bạn! Mình đã nhận được tin nhắn: "${text}". Mình sẽ phản hồi lại sớm nhé!`,
        time: getCurrentTime(),
        me: false,
      };
      setMessages(prev => [...prev, autoReply]);
    }, 1000);
  };

  const renderItem = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageRow,
        item.me ? styles.messageRowMe : styles.messageRowOther,
      ]}>
      {!item.me && (
        <View style={styles.otherAvatarContainer}>
          <Avatar name={name} size={32} />
        </View>
      )}

      <View
        style={[
          styles.bubble,
          item.me ? styles.bubbleMe : styles.bubbleOther,
        ]}>
        <Text style={[styles.messageText, item.me ? styles.textMe : styles.textOther]}>
          {item.text}
        </Text>
        <Text style={[styles.timeText, item.me ? styles.timeMe : styles.timeOther]}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      {/* Header thông tin người trò chuyện */}
      <View style={styles.chatHeaderBar}>
        <Avatar name={name} size={40} online={true} showOnline={true} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{name}</Text>
          <Text style={styles.headerStatus}>Đang trực tuyến</Text>
        </View>
      </View>

      {/* Danh sách tin nhắn */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Avatar name={name} size={64} />
            <Text style={styles.emptyTitle}>{name}</Text>
            <Text style={styles.emptySubtitle}>
              Hãy bắt đầu cuộc trò chuyện bằng cách gửi một tin nhắn bên dưới!
            </Text>
          </View>
        }
      />

      {/* Thanh nhập tin nhắn */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#9CA3AF"
          value={input}
          onChangeText={setInput}
          multiline
          returnKeyType="send"
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !input.trim() ? styles.sendButtonDisabled : null,
          ]}
          disabled={!input.trim()}
          onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  chatHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerInfo: {
    marginLeft: 12,
  },
  headerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerStatus: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  otherAvatarContainer: {
    marginRight: 8,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleMe: {
    backgroundColor: PRIMARY,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  textMe: {
    color: '#FFFFFF',
  },
  textOther: {
    color: '#1F2937',
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeMe: {
    color: '#BFDBFE',
  },
  timeOther: {
    color: '#9CA3AF',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
    color: '#111827',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: PRIMARY,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});
