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
import { Search, X, Users, MessageSquare } from 'lucide-react-native';
import { MainTabParamList, RootStackParamList } from '../../App';
import { getCurrentUser, UserProfile } from '../services/authService';
import { subscribeToUsers } from '../services/userService';
import Avatar from '../components/Avatar';
import { COLORS } from '../theme/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Contacts'>,
  NativeStackScreenProps<RootStackParamList>
>;

function ContactsSeparator() {
  return <View style={styles.separator} />;
}

export default function ContactsScreen({ navigation }: Props) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    const currentUid = currentUser?.uid || '';

    // Lắng nghe danh bạ người dùng từ Firebase (không gồm bản thân)
    const unsubscribe = subscribeToUsers(currentUid, userList => {
      setUsers(userList);
      setLoading(false);
    });

    // Cleanup listener khi unmount để không bị memory leak hay lặp dữ liệu
    return () => {
      unsubscribe();
    };
  }, []);

  const filtered = users.filter(
    u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const openUserChat = (user: UserProfile) => {
    const parent =
      navigation.getParent<NativeStackScreenProps<RootStackParamList>['navigation']>();
    parent?.navigate('ChatDetail', {
      id: user.uid,
      name: user.name,
      partnerId: user.uid,
    });
  };

  const onlineCount = users.filter(u => u.online).length;

  const renderItem = ({ item }: { item: UserProfile }) => (
    <View style={styles.contactItem}>
      <TouchableOpacity
        style={styles.contactMain}
        activeOpacity={0.7}
        onPress={() => openUserChat(item)}>
        <Avatar
          name={item.name}
          size={50}
          online={item.online}
          showOnline={true}
        />

        <View style={styles.contactInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                item.online ? styles.statusDotOnline : styles.statusDotOffline,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                item.online ? styles.statusOnline : styles.statusOffline,
              ]}>
              {item.online ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </Text>
          </View>
          {item.email ? (
            <Text style={styles.emailText} numberOfLines={1}>
              {item.email}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.chatButton}
        activeOpacity={0.8}
        onPress={() => openUserChat(item)}>
        <MessageSquare size={14} color={COLORS.primary} style={styles.chatButtonIcon} />
        <Text style={styles.chatButtonText}>Nhắn tin</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Ô tìm kiếm danh bạ */}
      <View style={styles.searchContainer}>
        <Search size={16} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên hoặc email..."
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

      {/* Thanh thống kê trạng thái */}
      <View style={styles.statusBar}>
        <Text style={styles.statusBarText}>
          Tổng số: <Text style={styles.bold}>{users.length}</Text> bạn bè •{' '}
          <Text style={styles.onlineHighlight}>{onlineCount} đang online</Text>
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải danh bạ từ Firebase...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.uid}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={ContactsSeparator}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Users size={36} color={COLORS.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>
                {search ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có liên hệ nào'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {search
                  ? 'Thử tìm với từ khóa hoặc email khác.'
                  : 'Hãy tạo tài khoản khác hoặc rủ bạn bè đăng ký để bắt đầu nhắn tin!'}
              </Text>
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
    marginTop: 12,
    marginBottom: 8,
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
  statusBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statusBarText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  bold: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  onlineHighlight: {
    color: COLORS.online,
    fontWeight: '700',
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
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  contactMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusDotOnline: {
    backgroundColor: COLORS.online,
  },
  statusDotOffline: {
    backgroundColor: COLORS.offline,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusOnline: {
    color: COLORS.online,
  },
  statusOffline: {
    color: COLORS.textMuted,
  },
  emailText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  chatButtonIcon: {
    marginRight: 4,
  },
  chatButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginLeft: 64,
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
  },
});
