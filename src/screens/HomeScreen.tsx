import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Search, X, MessageSquare } from 'lucide-react-native';
import { MainTabParamList, RootStackParamList } from '../../App';
import { getCurrentUser } from '../services/authService';
import {
  subscribeToConversations,
  markConversationAsRead,
  FirebaseConversation,
} from '../services/chatService';
import { subscribeToUsers } from '../services/userService';
import Avatar from '../components/Avatar';
import { COLORS } from '../theme/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

function ListSeparator() {
  return <View style={styles.separator} />;
}

export default function HomeScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<FirebaseConversation[]>([]);
  const [userPresenceMap, setUserPresenceMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.uid || '';

  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    // 1. Lắng nghe danh sách cuộc trò chuyện theo thời gian thực từ Firebase
    const unsubscribeConversations = subscribeToConversations(
      currentUserId,
      convList => {
        setConversations(convList);
        setLoading(false);
      },
    );

    // 2. Lắng nghe trạng thái online của tất cả người dùng để cập nhật trạng thái trong hội thoại
    const unsubscribeUsers = subscribeToUsers(currentUserId, users => {
      const presence: Record<string, boolean> = {};
      users.forEach(u => {
        presence[u.uid] = u.online;
      });
      setUserPresenceMap(presence);
    });

    // Cleanup khi component unmount để tránh bị lặp dữ liệu và leak bộ nhớ
    return () => {
      unsubscribeConversations();
      unsubscribeUsers();
    };
  }, [currentUserId]);

  const filtered = conversations.filter(
    c =>
      c.partnerName.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase()),
  );

  const openChat = async (partnerId: string, partnerName: string) => {
    // Đặt số tin nhắn chưa đọc về 0 khi mở cuộc trò chuyện
    await markConversationAsRead(currentUserId, partnerId);

    // Điều hướng sang màn hình chi tiết chat
    const parent =
      navigation.getParent<NativeStackScreenProps<RootStackParamList>['navigation']>();
    parent?.navigate('ChatDetail', {
      id: partnerId,
      name: partnerName,
      partnerId,
    });
  };

  const renderItem = ({ item }: { item: FirebaseConversation }) => {
    const isPartnerOnline = !!userPresenceMap[item.partnerId];

    return (
      <TouchableOpacity
        style={styles.chatItem}
        activeOpacity={0.7}
        onPress={() => openChat(item.partnerId, item.partnerName)}>
        {/* Ảnh đại diện với trạng thái online thời gian thực */}
        <Avatar
          name={item.partnerName}
          size={52}
          online={isPartnerOnline}
          showOnline={true}
        />

        <View style={styles.chatInfo}>
          <View style={styles.topRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.partnerName}
            </Text>
            <Text
              style={[
                styles.timeText,
                item.unread > 0 ? styles.timeTextUnread : null,
              ]}>
              {item.time}
            </Text>
          </View>

          <View style={styles.bottomRow}>
            <Text
              style={[
                styles.lastMessage,
                item.unread > 0 ? styles.lastMessageUnread : null,
              ]}
              numberOfLines={1}>
              {item.lastMessage}
            </Text>

            {/* Badge số tin nhắn chưa đọc */}
            {item.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {item.unread > 99 ? '99+' : item.unread}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Ô tìm kiếm cuộc trò chuyện */}
      <View style={styles.searchContainer}>
        <Search size={16} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm cuộc trò chuyện hoặc tin nhắn..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <X size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Danh sách cuộc trò chuyện */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải cuộc trò chuyện...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={ListSeparator}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <MessageSquare size={36} color={COLORS.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>
                {search ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có cuộc trò chuyện nào'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {search
                  ? 'Thử tìm kiếm với từ khóa khác.'
                  : 'Hãy vào Danh bạ để chọn người bạn muốn trò chuyện và gửi tin nhắn đầu tiên!'}
              </Text>
              {!search && (
                <TouchableOpacity
                  style={styles.startChatButton}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('Contacts')}>
                  <Text style={styles.startChatButtonText}>Mở Danh Bạ</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.card,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  chatInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  timeTextUnread: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  lastMessageUnread: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  unreadBadge: {
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginLeft: 66,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  startChatButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  startChatButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
