import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../App';
import { users, User } from '../data/mockData';
import Avatar from '../components/Avatar';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Contacts'>,
  NativeStackScreenProps<RootStackParamList>
>;

function ContactsSeparator() {
  return <View style={styles.separator} />;
}

function ContactsEmpty() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>👥</Text>
      <Text style={styles.emptyTitle}>Không tìm thấy người dùng</Text>
      <Text style={styles.emptySubtitle}>
        Không có liên hệ nào trùng khớp với từ khóa tìm kiếm.
      </Text>
    </View>
  );
}

export default function ContactsScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');

  const filtered = users.filter(
    u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search)) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase())),
  );

  const openUserChat = (user: User) => {
    // Điều hướng sang ChatDetail tương ứng với người dùng
    const parent = navigation.getParent<NativeStackScreenProps<RootStackParamList>['navigation']>();
    parent?.navigate('ChatDetail', {
      id: `u_${user.id}`,
      name: user.name,
    });
  };

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.contactItem}>
      <TouchableOpacity
        style={styles.contactMain}
        activeOpacity={0.7}
        onPress={() => openUserChat(item)}>
        {/* Avatar là chữ cái đầu của tên */}
        <Avatar
          name={item.name}
          size={50}
          online={item.online}
          showOnline={true}
        />

        <View style={styles.contactInfo}>
          <Text style={styles.userName}>{item.name}</Text>
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
          {item.phone ? <Text style={styles.phoneText}>{item.phone}</Text> : null}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => openUserChat(item)}>
        <Text style={styles.chatButtonText}>Nhắn tin</Text>
      </TouchableOpacity>
    </View>
  );

  const onlineCount = users.filter(u => u.online).length;

  return (
    <View style={styles.container}>
      {/* Ô tìm kiếm danh bạ */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên, số điện thoại..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Thanh thống kê trạng thái */}
      <View style={styles.statusBar}>
        <Text style={styles.statusBarText}>
          Tổng số: <Text style={styles.bold}>{users.length}</Text> bạn bè (
          <Text style={styles.onlineHighlight}>{onlineCount} đang online</Text>)
        </Text>
      </View>

      {/* Danh sách người dùng */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={ContactsSeparator}
        ListEmptyComponent={ContactsEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  clearIcon: {
    fontSize: 14,
    color: '#9CA3AF',
    paddingHorizontal: 4,
  },
  statusBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statusBarText: {
    fontSize: 12,
    color: '#6B7280',
  },
  bold: {
    fontWeight: 'bold',
    color: '#111827',
  },
  onlineHighlight: {
    color: '#059669',
    fontWeight: '600',
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
    fontWeight: '600',
    color: '#111827',
    marginBottom: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  statusDotOnline: {
    backgroundColor: '#10B981',
  },
  statusDotOffline: {
    backgroundColor: '#9CA3AF',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusOnline: {
    color: '#059669',
  },
  statusOffline: {
    color: '#6B7280',
  },
  phoneText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  chatButton: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  chatButtonText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 64,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
