import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { initialNotifications, AppNotification, PRIMARY } from '../data/mockData';

export default function NotificationsScreen() {
  const [list, setList] = useState<AppNotification[]>(initialNotifications);

  const markAsRead = (id: string) => {
    setList(prev =>
      prev.map(item => (item.id === id ? { ...item, read: true } : item)),
    );
  };

  const markAllAsRead = () => {
    setList(prev => prev.map(item => ({ ...item, read: true })));
  };

  const unreadCount = list.filter(n => !n.read).length;

  const renderItem = ({ item }: { item: AppNotification }) => (
    <View
      style={[
        styles.card,
        item.read ? styles.cardRead : styles.cardUnread,
      ]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          {!item.read && <View style={styles.unreadDot} />}
          <Text
            style={[
              styles.cardTitle,
              item.read ? styles.titleRead : styles.titleUnread,
            ]}>
            {item.title}
          </Text>
        </View>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>

      <Text
        style={[
          styles.contentText,
          item.read ? styles.contentRead : styles.contentUnread,
        ]}>
        {item.content}
      </Text>

      <View style={styles.cardFooter}>
        {item.read ? (
          <View style={styles.readStatusBox}>
            <Text style={styles.readStatusText}>✓ Đã đọc</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.markReadButton}
            onPress={() => markAsRead(item.id)}>
            <Text style={styles.markReadButtonText}>Đánh dấu đã đọc</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Thanh công cụ thông báo */}
      <View style={styles.topToolbar}>
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {unreadCount > 0 ? (
              <>
                Bạn có <Text style={styles.highlight}>{unreadCount}</Text> thông báo chưa đọc
              </>
            ) : (
              'Bạn đã đọc hết tất cả thông báo 🎉'
            )}
          </Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Đọc tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Danh sách thông báo */}
      <FlatList
        data={list}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>Chưa có thông báo nào</Text>
            <Text style={styles.emptySubtitle}>
              Khi có thông báo mới từ bạn bè hoặc hệ thống, chúng sẽ xuất hiện ở đây.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  topToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  countContainer: {
    flex: 1,
  },
  countText: {
    fontSize: 13,
    color: '#4B5563',
  },
  highlight: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  markAllButton: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  markAllText: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  card: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  cardUnread: {
    backgroundColor: '#FFFFFF',
    borderColor: '#93C5FD',
  },
  cardRead: {
    backgroundColor: '#FAFAFA',
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
    marginRight: 6,
  },
  cardTitle: {
    fontSize: 15,
  },
  titleUnread: {
    fontWeight: 'bold',
    color: '#111827',
  },
  titleRead: {
    fontWeight: '600',
    color: '#6B7280',
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  contentUnread: {
    color: '#374151',
    fontWeight: '500',
  },
  contentRead: {
    color: '#6B7280',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  markReadButton: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  markReadButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  readStatusBox: {
    paddingVertical: 4,
  },
  readStatusText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontStyle: 'italic',
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
    lineHeight: 18,
  },
});
