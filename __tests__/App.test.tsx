/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('../src/services/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}));

jest.mock('../src/services/authService', () => ({
  getCurrentUser: jest.fn(() => null),
  onAuthChange: jest.fn(() => () => {}),
  loginUser: jest.fn(),
  registerUser: jest.fn(),
  logoutUser: jest.fn(),
  getFriendlyAuthErrorMessage: jest.fn(() => 'Error message'),
}));

jest.mock('../src/services/userService', () => ({
  setupPresence: jest.fn(() => () => {}),
  subscribeToUsers: jest.fn(() => () => {}),
  subscribeToSingleUser: jest.fn(() => () => {}),
  getUserProfile: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('../src/services/chatService', () => ({
  getChatRoomId: jest.fn((a, b) => `${a}_${b}`),
  sendMessage: jest.fn(),
  subscribeToMessages: jest.fn(() => () => {}),
  subscribeToConversations: jest.fn(() => () => {}),
  markConversationAsRead: jest.fn(),
  formatMessageTime: jest.fn(() => '10:00'),
}));

jest.mock('../src/services/locationService', () => ({
  requestLocationPermission: jest.fn(() => Promise.resolve(true)),
  getCurrentCoordinates: jest.fn(() => Promise.resolve({ latitude: 21.0, longitude: 105.0 })),
  openLocationOnMap: jest.fn(),
}));

jest.mock('@react-native-community/geolocation', () => ({
  requestAuthorization: jest.fn(),
  getCurrentPosition: jest.fn(),
}));

jest.mock('lucide-react-native', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return new Proxy(
    {},
    {
      get: () => {
        const MockIcon = (props: any) => mockReact.createElement(View, props);
        return MockIcon;
      },
    },
  );
});

jest.mock('react-native-svg', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => mockReact.createElement(View, props),
    Svg: (props: any) => mockReact.createElement(View, props),
    Path: (props: any) => mockReact.createElement(View, props),
  };
});

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
