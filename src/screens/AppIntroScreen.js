import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, ScrollView,
  TouchableOpacity, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../AppContext';
import { Icon } from '../components/primitives';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Share the load.',
    description: 'Welcome to LoadShare. A transparent way to manage household tasks without the mental load.',
    icon: 'home',
  },
  {
    id: '2',
    title: 'Track effort.',
    description: 'Every task is weighted. See who is carrying what, and balance the scales together.',
    icon: 'flag',
  },
  {
    id: '3',
    title: 'Stay in sync.',
    description: 'Notifications keep you updated, but gently. Say goodbye to nagging.',
    icon: 'bell',
  },
];

export function AppIntroScreen({ onComplete }) {
  const insets = useSafeAreaInsets();
  const { palette } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const nextSlide = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (currentIndex + 1) * width, animated: true });
    } else {
      onComplete();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      >
        {SLIDES.map((slide, i) => (
          <View key={slide.id} style={[styles.slide, { width }]}>
            <View style={[styles.iconCircle, { backgroundColor: palette.surface, borderColor: palette.lineStrong }]}>
              <Icon name={slide.icon} size={48} color={palette.ink} />
            </View>
            <Text style={[styles.title, { color: palette.ink }]}>{slide.title}</Text>
            <Text style={[styles.description, { color: palette.muted }]}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.pagination}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === currentIndex ? palette.ink : palette.lineStrong },
                i === currentIndex && { width: 24 },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: palette.ink }]}
          onPress={nextSlide}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: palette.surface }]}>
            {currentIndex === SLIDES.length - 1 ? "Let's go" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontFamily: 'InstrumentSerif_400Regular',
    fontSize: 42,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
  },
});
