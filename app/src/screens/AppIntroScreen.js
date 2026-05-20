import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/primitives';
import { COLORS } from '../colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  { id: '1', title: 'Share the load.',   icon: 'home', description: 'Welcome to LoadShare. A transparent way to manage household tasks without the mental load.' },
  { id: '2', title: 'Track effort.',     icon: 'flag', description: 'Every task is weighted. See who is carrying what, and balance the scales together.' },
  { id: '3', title: 'Stay in sync.',     icon: 'bell', description: 'Notifications keep you updated, but gently. Say goodbye to nagging.' },
];

export function AppIntroScreen({ onComplete }) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    if (index !== currentIndex) setCurrentIndex(index);
  };

  const nextSlide = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (currentIndex + 1) * width, animated: true });
    } else {
      onComplete();
    }
  };

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        ref={scrollRef}
        horizontal pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      >
        {SLIDES.map(slide => (
          <View key={slide.id} style={{ width }} className="flex-1 items-center justify-center px-8">
            <View
              className="w-[120px] h-[120px] rounded-full border bg-surface border-line-strong items-center justify-center mb-10"
              style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 }}
            >
              <Icon name={slide.icon} size={48} color={COLORS.ink} />
            </View>
            <Text className="font-serif text-7xl text-ink text-center mb-4">{slide.title}</Text>
            <Text className="font-sans text-xl text-muted text-center leading-6">{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={{ paddingBottom: Math.max(insets.bottom, 24) }} className="px-6 pt-4">
        <View className="flex-row justify-center items-center mb-6 gap-2">
          {SLIDES.map((_, i) => (
            <View key={i} className={`h-2 rounded-full ${i === currentIndex ? 'bg-ink' : 'bg-line-strong'}`}
              style={{ width: i === currentIndex ? 24 : 8 }} />
          ))}
        </View>
        <TouchableOpacity className="py-4 rounded-2xl bg-ink items-center" onPress={nextSlide} activeOpacity={0.8}>
          <Text className="font-sans-bold text-lg text-surface">
            {currentIndex === SLIDES.length - 1 ? "Let's go" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
