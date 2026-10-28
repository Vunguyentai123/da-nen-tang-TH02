import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Check, BellOff } from 'lucide-react-native';
import { initialNotifications, AppNotification } from '../data/mockData';
import { COLORS, SHADOWS } from '../theme/theme';

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
            <Check size={14} color={COLORS.textMuted} style={styles.checkIcon} />
            <Text style={styles.readStatusText}>Đã đọc</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.markReadButton}
            activeOpacity={0.8}
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
              'Bạn đã đọc hết tất cả thông báo'
            )}
          </Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            activeOpacity={0.8}
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
            <View style={styles.emptyIconCircle}>
              <BellOff size={36} color={COLORS.textMuted} />
            </View>
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
    backgroundColor: COLORS.background,
  },
  topToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  countContainer: {
    flex: 1,
  },
  countText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  highlight: {
    color: COLORS.danger,
    fontWeight: '700',
  },
  markAllButton: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  markAllText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    ...SHADOWS.card,
  },
  cardUnread: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.primaryBorder,
  },
  cardRead: {
    backgroundColor: '#FAFAFA',
    borderColor: COLORS.border,
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
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 15,
  },
  titleUnread: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  titleRead: {
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  contentUnread: {
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  contentRead: {
    color: COLORS.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  markReadButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  markReadButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  readStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checkIcon: {
    marginRight: 4,
  },
  readStatusText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
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
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
