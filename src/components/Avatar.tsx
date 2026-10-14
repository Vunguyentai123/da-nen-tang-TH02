import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AvatarProps {
  name: string;
  size?: number;
  online?: boolean;
  showOnline?: boolean;
}

const AVATAR_COLORS = [
  '#2563EB', // Blue
  '#059669', // Green
  '#D97706', // Amber
  '#DC2626', // Red
  '#7C3AED', // Purple
  '#DB2777', // Pink
  '#0891B2', // Cyan
  '#EA580C', // Orange
  '#4F46E5', // Indigo
  '#0D9488', // Teal
];

export const getAvatarColor = (name: string): string => {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 1000007;
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

export const getInitial = (name: string): string => {
  if (!name) return '?';
  const trimmed = name.trim();
  return trimmed.charAt(0).toUpperCase();
};

export default function Avatar({
  name,
  size = 48,
  online = false,
  showOnline = false,
}: AvatarProps) {
  const initial = getInitial(name);
  const backgroundColor = getAvatarColor(name);
  const dotSize = Math.max(10, Math.round(size * 0.26));

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor,
          },
        ]}>
        <Text
          style={[
            styles.text,
            {
              fontSize: Math.round(size * 0.44),
              lineHeight: Math.round(size * 0.5),
            },
          ]}>
          {initial}
        </Text>
      </View>
      {showOnline && (
        <View
          style={[
            styles.statusDot,
            styles.statusDotPosition,
            online ? styles.onlineDot : styles.offlineDot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statusDot: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  statusDotPosition: {
    bottom: 0,
    right: 0,
  },
  onlineDot: {
    backgroundColor: '#10B981',
  },
  offlineDot: {
    backgroundColor: '#9CA3AF',
  },
});
