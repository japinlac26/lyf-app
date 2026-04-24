import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useCharacterStore } from '@/src/store/characterStore';

export default function LevelUpModal() {
  const level = useCharacterStore((s) => s.level);

  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const badgeScale = useSharedValue(0);

  useEffect(() => {
    // Screen shake via scale pulse, then badge pop
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    opacity.value = withTiming(1, { duration: 200 });
    scale.value = withSequence(withSpring(1.05, { damping: 8 }), withSpring(1, { damping: 14 }));
    badgeScale.value = withDelay(300, withSpring(1, { damping: 10, stiffness: 180 }));
  }, [badgeScale, opacity, scale]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  return (
    <View style={styles.backdrop}>
      <Animated.View style={[styles.card, overlayStyle]}>
        <Text style={styles.title}>Level Up!</Text>

        <Animated.View style={[styles.badge, badgeStyle]}>
          <Text style={styles.badgeLevel}>{level}</Text>
          <Text style={styles.badgeLabel}>LEVEL</Text>
        </Animated.View>

        <Text style={styles.message}>Your hero grows stronger. Keep going!</Text>

        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    gap: 20,
    width: '80%',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  badge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#6c63ff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6c63ff',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  badgeLevel: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 56,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
  },
  message: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6c63ff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
