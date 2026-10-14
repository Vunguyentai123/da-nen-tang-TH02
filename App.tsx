import React from 'react';
import { StatusBar, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ChatDetailScreen from './src/screens/ChatDetailScreen';
import { PRIMARY } from './src/data/mockData';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  ChatDetail: { id: string; name: string };
};

export type MainTabParamList = {
  Home: undefined;
  Contacts: undefined;
  Notifications: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, string> = {
  Home: '💬',
  Contacts: '👥',
  Notifications: '🔔',
  Settings: '⚙️',
};

function makeTabIcon(routeName: keyof MainTabParamList) {
  const Icon = ({ color, size }: { color: string; size: number }) => (
    <Text style={[styles.tabIcon, { color, fontSize: size }]}>{TAB_ICONS[routeName]}</Text>
  );
  return Icon;
}

const HomeTabIcon = makeTabIcon('Home');
const ContactsTabIcon = makeTabIcon('Contacts');
const NotificationsTabIcon = makeTabIcon('Notifications');
const SettingsTabIcon = makeTabIcon('Settings');

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: PRIMARY },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
        headerTitleAlign: 'center',
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          height: 60,
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
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ChatDetail"
            component={ChatDetailScreen}
            options={({ route }) => ({
              title: route.params.name,
              headerStyle: { backgroundColor: PRIMARY },
              headerTintColor: '#FFFFFF',
              headerTitleStyle: { fontWeight: 'bold' },
              headerBackTitle: 'Quay lại',
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 20,
  },
});
