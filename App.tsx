import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MessageSquare, Users, Bell, Settings } from 'lucide-react-native';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ChatDetailScreen from './src/screens/ChatDetailScreen';

import { onAuthChange } from './src/services/authService';
import { setupPresence } from './src/services/userService';
import { COLORS } from './src/theme/theme';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  ChatDetail: { id: string; name: string; partnerId?: string };
};

export type MainTabParamList = {
  Home: undefined;
  Contacts: undefined;
  Notifications: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function HomeTabIcon({ color, size }: { color: string; size: number }) {
  return <MessageSquare color={color} size={size} />;
}

function ContactsTabIcon({ color, size }: { color: string; size: number }) {
  return <Users color={color} size={size} />;
}

function NotificationsTabIcon({ color, size }: { color: string; size: number }) {
  return <Bell color={color} size={size} />;
}

function SettingsTabIcon({ color, size }: { color: string; size: number }) {
  return <Settings color={color} size={size} />;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerTitleAlign: 'center',
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: COLORS.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Cuộc trò chuyện',
          tabBarLabel: 'Tin nhắn',
          tabBarIcon: HomeTabIcon,
        }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{
          title: 'Danh bạ',
          tabBarLabel: 'Danh bạ',
          tabBarIcon: ContactsTabIcon,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Thông báo',
          tabBarLabel: 'Thông báo',
          tabBarIcon: NotificationsTabIcon,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Cài đặt',
          tabBarLabel: 'Cài đặt',
          tabBarIcon: SettingsTabIcon,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  // Lắng nghe trạng thái đăng nhập để kích hoạt Presence (online/offline)
  useEffect(() => {
    let presenceCleanup: (() => void) | null = null;

    const unsubscribeAuth = onAuthChange(user => {
      if (presenceCleanup) {
        presenceCleanup();
        presenceCleanup = null;
      }
      if (user) {
        presenceCleanup = setupPresence(user.uid);
      }
    });

    return () => {
      unsubscribeAuth();
      if (presenceCleanup) {
        presenceCleanup();
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" />
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ChatDetail"
            component={ChatDetailScreen}
            options={({ route }) => ({
              title: route.params.name,
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: '#FFFFFF',
              headerTitleStyle: { fontWeight: '700' },
              headerBackTitle: 'Quay lại',
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
