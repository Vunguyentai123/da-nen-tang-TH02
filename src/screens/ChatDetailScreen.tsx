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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapPin, Send, ExternalLink } from 'lucide-react-native';
import { RootStackParamList } from '../../App';
import { getCurrentUser, UserProfile } from '../services/authService';
import {
  getChatRoomId,
  sendMessage,
  getFriendlyChatErrorMessage,
  subscribeToMessages,
  markConversationAsRead,
  FirebaseChatMessage,
} from '../services/chatService';
import { subscribeToSingleUser } from '../services/userService';
import { getCurrentCoordinates, openLocationOnMap } from '../services/locationService';
import Avatar from '../components/Avatar';
import { COLORS, SHADOWS } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatDetail'>;

export default function ChatDetailScreen({ route }: Props) {
  const { id, name, partnerId: paramPartnerId } = route.params;
  const partnerId = paramPartnerId || id;

  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.uid || '';
  const currentUserName = currentUser?.displayName || 'Tôi';

  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<FirebaseChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sendingLocation, setSendingLocation] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const listRef = useRef<FlatList<FirebaseChatMessage>>(null);
  const chatId = getChatRoomId(currentUserId, partnerId);

  // 1. Đánh dấu đã đọc & Lắng nghe tin nhắn phòng chat
  useEffect(() => {
    if (!currentUserId || !partnerId) return;

    // Đánh dấu đã đọc khi vừa vào màn hình
    markConversationAsRead(currentUserId, partnerId);

    // Lắng nghe tin nhắn thời gian thực
    const unsubscribeMessages = subscribeToMessages(chatId, newMessages => {
      setMessages(newMessages);
      setLoadingMessages(false);
      // Đánh dấu đã đọc khi có tin nhắn mới tới lúc đang ở màn hình chat
      markConversationAsRead(currentUserId, partnerId);
    });

    // Lắng nghe trạng thái trực tuyến của đối phương
    const unsubscribePartner = subscribeToSingleUser(partnerId, user => {
      if (user) {
        setPartner(user);
      }
    });

    // Cleanup: hủy đăng ký cả 2 listener khi thoát màn hình để không bị lặp tin
    return () => {
      unsubscribeMessages();
      unsubscribePartner();
    };
  }, [chatId, currentUserId, partnerId]);

  // Gửi tin nhắn thông thường
  const handleSendText = async () => {
    const text = input.trim();
    if (!text) return; // Không cho gửi tin rỗng

    try {
      await sendMessage({
        senderId: currentUserId,
        senderName: currentUserName,
        receiverId: partnerId,
        receiverName: partner?.name || name,
        text,
        type: 'text',
      });
      setInput('');
      listRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error);
      Alert.alert('Lỗi gửi tin nhắn', getFriendlyChatErrorMessage(error));
    }
  };

  // Gửi vị trí hiện tại
  const handleSendLocation = async () => {
    if (sendingLocation) return;
    setSendingLocation(true);

    try {
      const coords = await getCurrentCoordinates();
      await sendMessage({
        senderId: currentUserId,
        senderName: currentUserName,
        receiverId: partnerId,
        receiverName: partner?.name || name,
        text: 'Vị trí hiện tại',
        type: 'location',
        location: coords,
      });
      listRef.current?.scrollToEnd({ animated: true });
    } catch {
      // Thông báo lỗi đã được xử lý trong locationService
    } finally {
      setSendingLocation(false);
    }
  };

  const isOnline = partner ? partner.online : false;

  const renderItem = ({ item }: { item: FirebaseChatMessage }) => {
    const isMe = item.senderId === currentUserId;
    const isLocation = item.type === 'location' && item.location;

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowMe : styles.messageRowOther,
        ]}>
        {!isMe && (
          <View style={styles.otherAvatarContainer}>
            <Avatar name={partner?.name || name} size={32} />
          </View>
        )}

        <View
          style={[
            styles.bubble,
            isMe ? styles.bubbleMe : styles.bubbleOther,
            isLocation ? styles.locationBubble : null,
          ]}>
          {isLocation ? (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.locationCard}
              onPress={() =>
                openLocationOnMap(
                  item.location!.latitude,
                  item.location!.longitude,
                )
              }>
              <View style={styles.locationHeader}>
                <MapPin
                  size={18}
                  color={isMe ? '#FFFFFF' : COLORS.primary}
                  style={styles.locationPinIcon}
                />
                <Text
                  style={[
                    styles.locationTitle,
                    isMe ? styles.textMe : styles.locationTitleOther,
                  ]}>
                  Vị trí đã chia sẻ
                </Text>
              </View>

              <View
                style={[
                  styles.coordsBadge,
                  isMe ? styles.coordsBadgeMe : styles.coordsBadgeOther,
                ]}>
                <Text
                  style={[
                    styles.coordsText,
                    isMe ? styles.textMe : styles.textOther,
                  ]}>
                  {item.location!.latitude.toFixed(5)}, {item.location!.longitude.toFixed(5)}
                </Text>
              </View>

              <View style={styles.openMapRow}>
                <Text
                  style={[
                    styles.openMapText,
                    isMe ? styles.openMapTextMe : styles.openMapTextOther,
                  ]}>
                  Mở Google Maps
                </Text>
                <ExternalLink
                  size={13}
                  color={isMe ? '#FFFFFF' : COLORS.primary}
                  style={styles.externalIcon}
                />
              </View>
            </TouchableOpacity>
          ) : (
            <Text
              style={[
                styles.messageText,
                isMe ? styles.textMe : styles.textOther,
              ]}>
              {item.text}
            </Text>
          )}

          <Text
            style={[
              styles.timeText,
              isMe ? styles.timeMe : styles.timeOther,
            ]}>
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      {/* Header trạng thái đối phương */}
      <View style={styles.headerBar}>
        <Avatar
          name={partner?.name || name}
          size={42}
          online={isOnline}
          showOnline={true}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {partner?.name || name}
          </Text>
          <View style={styles.headerStatusRow}>
            <View
              style={[
                styles.headerDot,
                isOnline ? styles.headerDotOnline : styles.headerDotOffline,
              ]}
            />
            <Text
              style={[
                styles.headerStatusText,
                isOnline ? styles.headerStatusOnline : styles.headerStatusOffline,
              ]}>
              {isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </Text>
          </View>
        </View>
      </View>

      {/* Danh sách tin nhắn */}
      {loadingMessages ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải cuộc trò chuyện...</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Avatar name={partner?.name || name} size={64} />
              <Text style={styles.emptyTitle}>{partner?.name || name}</Text>
              <Text style={styles.emptySubtitle}>
                Chưa có tin nhắn nào. Hãy gửi lời chào hoặc chia sẻ vị trí để bắt đầu cuộc trò chuyện!
              </Text>
            </View>
          }
        />
      )}

      {/* Thanh nhập tin nhắn */}
      <View style={styles.inputBar}>
        {/* Nút gửi vị trí */}
        <TouchableOpacity
          style={styles.locationButton}
          activeOpacity={0.7}
          onPress={handleSendLocation}
          disabled={sendingLocation}>
          {sendingLocation ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <MapPin size={20} color={COLORS.primary} />
          )}
        </TouchableOpacity>

        {/* Ô nhập tin nhắn */}
        <TextInput
          style={styles.textInput}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor={COLORS.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSendText}
        />

        {/* Nút gửi */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            !input.trim() ? styles.sendButtonDisabled : null,
          ]}
          disabled={!input.trim()}
          activeOpacity={0.8}
          onPress={handleSendText}>
          <Send size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  headerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  headerDotOnline: {
    backgroundColor: COLORS.online,
  },
  headerDotOffline: {
    backgroundColor: COLORS.offline,
  },
  headerStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerStatusOnline: {
    color: COLORS.online,
  },
  headerStatusOffline: {
    color: COLORS.textMuted,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.textSecondary,
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
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...SHADOWS.card,
  },
  bubbleMe: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationBubble: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  textMe: {
    color: '#FFFFFF',
  },
  textOther: {
    color: COLORS.textPrimary,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeMe: {
    color: COLORS.primarySubtle,
  },
  timeOther: {
    color: COLORS.textMuted,
  },
  locationCard: {
    minWidth: 180,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationPinIcon: {
    marginRight: 6,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  locationTitleOther: {
    color: COLORS.textPrimary,
  },
  coordsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  coordsBadgeMe: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  coordsBadgeOther: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  coordsText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
  },
  openMapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  openMapText: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
  openMapTextMe: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
  openMapTextOther: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  externalIcon: {
    marginLeft: 2,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  locationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  sendButton: {
    width: 42,
    height: 42,
    backgroundColor: COLORS.primary,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.primaryBorder,
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
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 14,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
