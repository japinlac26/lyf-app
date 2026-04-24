import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface XPBarProps {
  level: number;
  xpPercent: number; // 0–1
  xpIntoLevel: number;
  xpNeededForLevel: number;
}

export function XPBar({ level, xpPercent, xpIntoLevel, xpNeededForLevel }: XPBarProps) {
  const fillWidth = useSharedValue(xpPercent);
  const prevPercent = useRef(xpPercent);

  useEffect(() => {
    if (xpPercent !== prevPercent.current) {
      fillWidth.value = withSpring(xpPercent, { damping: 20, stiffness: 120 });
      prevPercent.current = xpPercent;
    }
  }, [xpPercent, fillWidth]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillWidth.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.levelText}>Lv {level}</Text>
        <Text style={styles.xpText}>
          {xpIntoLevel} / {xpNeededForLevel} XP
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  xpText: {
    fontSize: 12,
    color: '#555',
  },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#6c63ff',
  },
});
