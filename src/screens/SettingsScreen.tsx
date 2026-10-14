import React, { useState } from 'react';
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
import { MainTabParamList, RootStackParamList } from '../../App';
import { currentUser, PRIMARY } from '../data/mockData';
import Avatar from '../components/Avatar';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Settings'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function SettingsScreen({ navigation }: Props) {
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeStatusEnabled, setActiveStatusEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            const parent =
              navigation.getParent<NativeStackScreenProps<RootStackParamList>['navigation']>();
            parent?.replace('Login');
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Thông tin tài khoản */}
      <View style={styles.profileCard}>
        <Avatar
          name={currentUser.name}
          size={56}
          online={activeStatusEnabled}
          showOnline={true}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{currentUser.name}</Text>
          <Text style={styles.profileEmail}>{currentUser.email}</Text>
          {currentUser.phone ? (
            <Text style={styles.profilePhone}>{currentUser.phone}</Text>
          ) : null}
        </View>
      </View>

      {/* Cài đặt chung */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Thông báo tin nhắn</Text>
          <Switch
            value={notifyEnabled}
            onValueChange={setNotifyEnabled}
            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
            thumbColor={notifyEnabled ? PRIMARY : '#F3F4F6'}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Âm thanh</Text>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
            thumbColor={soundEnabled ? PRIMARY : '#F3F4F6'}
          />
        </View>

        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.rowLabel}>Hiển thị trạng thái online</Text>
          <Switch
            value={activeStatusEnabled}
            onValueChange={setActiveStatusEnabled}
            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
            thumbColor={activeStatusEnabled ? PRIMARY : '#F3F4F6'}
          />
        </View>
      </View>

      {/* Thông tin ứng dụng */}
      <View style={styles.appInfoCard}>
        <Text style={styles.appName}>UDU Chat</Text>
        <Text style={styles.appVersion}>Phiên bản 1.0.0</Text>
      </View>

      {/* Nút Đăng xuất */}
      <TouchableOpacity
        style={styles.logoutButton}
        activeOpacity={0.8}
        onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Đăng Xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 12,
  },
  profileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
  },
  profileEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  profilePhone: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontSize: 15,
    color: '#1F2937',
  },
  appInfoCard: {
    paddingVertical: 12,
    marginBottom: 12,
  },
  appName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  appVersion: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
