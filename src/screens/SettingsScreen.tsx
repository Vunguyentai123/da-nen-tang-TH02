import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Bell,
  Volume2,
  Activity,
  LogOut,
  CheckCircle2,
} from 'lucide-react-native';
import { MainTabParamList, RootStackParamList } from '../../App';
import { getCurrentUser, logoutUser } from '../services/authService';
import { getUserProfile } from '../services/userService';
import Avatar from '../components/Avatar';
import { COLORS, SHADOWS } from '../theme/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Settings'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function SettingsScreen({ navigation }: Props) {
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeStatusEnabled, setActiveStatusEnabled] = useState(true);
  const [userName, setUserName] = useState('Người dùng');
  const [userEmail, setUserEmail] = useState('');

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (currentUser) {
      setUserName(currentUser.displayName || 'Người dùng');
      setUserEmail(currentUser.email || '');

      // Tải thông tin chi tiết từ Realtime Database
      getUserProfile(currentUser.uid).then(profile => {
        if (profile?.name) {
          setUserName(profile.name);
        }
      });
    }
  }, [currentUser]);

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản UDU Chat?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutUser();
              const parent =
                navigation.getParent<NativeStackScreenProps<RootStackParamList>['navigation']>();
              parent?.replace('Login');
            } catch (error) {
              console.warn('Lỗi khi đăng xuất:', error);
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Avatar
          name={userName}
          size={60}
          online={activeStatusEnabled}
          showOnline={true}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userName}</Text>
          <Text style={styles.profileEmail}>{userEmail}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.firebaseBadge}>
              <CheckCircle2 size={12} color={COLORS.success} style={styles.badgeIcon} />
              <Text style={styles.firebaseBadgeText}>Firebase Auth</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Cài đặt thông báo & âm thanh */}
      <Text style={styles.sectionTitle}>Tùy chọn</Text>
      <View style={styles.cardSection}>
        <View style={styles.row}>
          <View style={styles.rowLabelGroup}>
            <Bell size={18} color={COLORS.textSecondary} style={styles.rowIcon} />
            <Text style={styles.rowLabel}>Thông báo tin nhắn</Text>
          </View>
          <Switch
            value={notifyEnabled}
            onValueChange={setNotifyEnabled}
            trackColor={{ false: COLORS.border, true: COLORS.primarySubtle }}
            thumbColor={notifyEnabled ? COLORS.primary : '#F3F4F6'}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowLabelGroup}>
            <Volume2 size={18} color={COLORS.textSecondary} style={styles.rowIcon} />
            <Text style={styles.rowLabel}>Âm thanh thông báo</Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: COLORS.border, true: COLORS.primarySubtle }}
            thumbColor={soundEnabled ? COLORS.primary : '#F3F4F6'}
          />
        </View>

        <View style={[styles.row, styles.rowLast]}>
          <View style={styles.rowLabelGroup}>
            <Activity size={18} color={COLORS.textSecondary} style={styles.rowIcon} />
            <Text style={styles.rowLabel}>Hiển thị trạng thái hoạt động</Text>
          </View>
          <Switch
            value={activeStatusEnabled}
            onValueChange={setActiveStatusEnabled}
            trackColor={{ false: COLORS.border, true: COLORS.primarySubtle }}
            thumbColor={activeStatusEnabled ? COLORS.primary : '#F3F4F6'}
          />
        </View>
      </View>

      {/* Thông tin ứng dụng */}
      <Text style={styles.sectionTitle}>Thông tin ứng dụng</Text>
      <View style={styles.cardSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phiên bản</Text>
          <Text style={styles.infoValue}>2.0.0 (Firebase RTDB)</Text>
        </View>
        <View style={[styles.infoRow, styles.rowLast]}>
          <Text style={styles.infoLabel}>Nền tảng</Text>
          <Text style={styles.infoValue}>React Native CLI</Text>
        </View>
      </View>

      {/* Nút Đăng xuất */}
      <TouchableOpacity
        style={styles.logoutButton}
        activeOpacity={0.8}
        onPress={handleLogout}>
        <LogOut size={18} color="#FFFFFF" style={styles.logoutIcon} />
        <Text style={styles.logoutButtonText}>Đăng Xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    ...SHADOWS.card,
  },
  profileInfo: {
    marginLeft: 14,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  profileEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  firebaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgeIcon: {
    marginRight: 4,
  },
  firebaseBadgeText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  cardSection: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    ...SHADOWS.card,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: 10,
  },
  rowLabel: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: COLORS.danger,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
