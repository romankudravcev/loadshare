import React, { useEffect, useRef, useState, useMemo, ComponentProps } from "react";
import { View, Text, type ViewStyle } from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay, Easing, type SharedValue,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { scheduleOnRN } from "react-native-worklets";
import { useApp } from "../../context/AppContext";
import { COLORS } from "../../colors";
import { TIMING, CHIP, TEXT_SLOT, ANIM, SPRING, ALL_TASKS, type StartupTask } from "../../constants/startup";
import { LSMark, ARC_LEN } from "./LSMark";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

const EASE_OUT = Easing.out(Easing.cubic);
const EASE_IN  = Easing.in(Easing.cubic);

const ROLE_COLORS: Record<string, string> = {
  planner: COLORS.planner, organizer: COLORS.organizer,
  reminder: COLORS.reminder, executor: COLORS.executor,
};

type Props = { onComplete: () => void };

export function StartupScreen({ onComplete }: Props) {
  const { loading } = useApp() as { loading: boolean };
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  const queue = useMemo<StartupTask[]>(() => {
    const shuffled = [...ALL_TASKS].sort(() => Math.random() - 0.5);
    return [...shuffled, ...shuffled];
  }, []);

  const [phase, setPhase] = useState<"logo" | "ticker">("logo");
  const [, forceUpdate] = useState(0);
  const ticksAfterDone = useRef(0);
  const exitScheduled  = useRef(false);
  const incomingIdx    = useRef(0);

  const arc0 = useSharedValue(ARC_LEN), arc1 = useSharedValue(ARC_LEN);
  const arc2 = useSharedValue(ARC_LEN), arc3 = useSharedValue(ARC_LEN);
  const arcValues: SharedValue<number>[] = [arc0, arc1, arc2, arc3];
  const pipValue = useSharedValue(0);

  const wordAnim    = useSharedValue(0), tagAnim     = useSharedValue(0);
  const logoLayer   = useSharedValue(1), tickerLayer = useSharedValue(0);
  const screenFade  = useSharedValue(1);
  const inOpacity   = useSharedValue<number>(0);
  const inSlide     = useSharedValue<number>(ANIM.slideFrom);
  const inScale     = useSharedValue<number>(ANIM.inScaleFrom);

  const screenFadeStyle  = useAnimatedStyle(() => ({ opacity: screenFade.value }));
  const logoLayerStyle   = useAnimatedStyle(() => ({ opacity: logoLayer.value }));
  const tickerLayerStyle = useAnimatedStyle(() => ({ opacity: tickerLayer.value }));
  const wordStyle  = useAnimatedStyle(() => ({ opacity: wordAnim.value, transform: [{ translateY: (1 - wordAnim.value) * ANIM.wordTranslateY }] }));
  const tagStyle   = useAnimatedStyle(() => ({ opacity: tagAnim.value }));
  const inIconStyle = useAnimatedStyle(() => ({ opacity: inOpacity.value, transform: [{ scale: inScale.value }] }));
  const inTextStyle = useAnimatedStyle(() => ({
    opacity: inOpacity.value,
    transform: [{ translateY: inSlide.value }, { scale: inScale.value }] as ViewStyle["transform"],
  }));

  const resetIncoming = () => { inOpacity.value = 0; inSlide.value = ANIM.slideFrom; inScale.value = ANIM.inScaleFrom; };
  const animateIncoming = () => {
    inOpacity.value = withTiming(1, { duration: TIMING.initialIncoming, easing: EASE_OUT });
    inSlide.value   = withTiming(0, { duration: TIMING.initialIncoming + 20, easing: EASE_OUT });
    inScale.value   = withTiming(1, { duration: TIMING.initialIncoming + 20, easing: EASE_OUT });
  };
  const doExit = () => {
    if (exitScheduled.current) return;
    exitScheduled.current = true;
    screenFade.value = withTiming(0, { duration: TIMING.exitFade, easing: EASE_OUT }, (finished) => {
      if (finished && onCompleteRef.current) scheduleOnRN(onCompleteRef.current);
    });
  };
  const updateContent = () => { incomingIdx.current = (incomingIdx.current + 1) % queue.length; forceUpdate(n => n + 1); };
  const advanceTick = () => {
    if (!loading) ticksAfterDone.current += 1;
    inOpacity.value = withTiming(0, { duration: TIMING.tickFadeOut, easing: EASE_IN }, (finished) => {
      if (!finished) return;
      inSlide.value = ANIM.slideFrom; inScale.value = ANIM.inScaleFrom;
      scheduleOnRN(updateContent);
      inOpacity.value = withDelay(TIMING.tickBuffer, withTiming(1, { duration: TIMING.tickFadeIn, easing: EASE_OUT }));
      inSlide.value   = withDelay(TIMING.tickBuffer, withTiming(0, { duration: TIMING.tickSlideDuration, easing: EASE_OUT }));
      inScale.value   = withDelay(TIMING.tickBuffer, withTiming(1, { duration: TIMING.tickSlideDuration, easing: EASE_OUT }));
    });
  };

  useEffect(() => {
    arcValues.forEach((sv, i) => { sv.value = withDelay(i * TIMING.arcStagger, withTiming(0, { duration: TIMING.arcDuration, easing: EASE_OUT })); });
    const t1 = setTimeout(() => { pipValue.value = withSpring(1, { damping: SPRING.damping, stiffness: SPRING.stiffness }); }, TIMING.pipDelay);
    const t2 = setTimeout(() => { wordAnim.value = withTiming(1, { duration: TIMING.wordDuration, easing: EASE_OUT }); }, TIMING.wordDelay);
    const t3 = setTimeout(() => { tagAnim.value  = withTiming(1, { duration: TIMING.taglineDuration, easing: EASE_OUT }); }, TIMING.taglineDelay);
    const t4 = setTimeout(() => {
      setPhase("ticker");
      logoLayer.value   = withTiming(0, { duration: TIMING.layerCrossfade, easing: EASE_OUT });
      tickerLayer.value = withTiming(1, { duration: TIMING.layerCrossfade, easing: EASE_OUT });
      resetIncoming(); animateIncoming();
    }, TIMING.logoHold);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase !== "ticker") return;
    const id = setInterval(() => {
      if (!loading && ticksAfterDone.current >= TIMING.minTicksAfterLoad) { clearInterval(id); setTimeout(doExit, TIMING.exitDelay); return; }
      advanceTick();
    }, TIMING.tick);
    return () => clearInterval(id);
  }, [phase, loading]);

  const currentTask = queue[incomingIdx.current];
  const roleColor = ROLE_COLORS[currentTask?.role] ?? COLORS.muted;

  return (
    <Animated.View className="flex-1 items-center justify-center bg-canvas" style={screenFadeStyle}>
      {/* Logo layer */}
      <Animated.View className="absolute inset-0 items-center justify-center" style={logoLayerStyle} pointerEvents="none">
        <LSMark inkColor={COLORS.ink} roleColors={ROLE_COLORS} arcValues={arcValues} pipValue={pipValue} />
        <Animated.Text className="font-serif text-6xl text-ink" style={[{ marginTop: 20, letterSpacing: -0.4 }, wordStyle]}>
          Load<Text style={{ fontFamily: 'InstrumentSerif_400Regular_Italic' }}>Share</Text>
        </Animated.Text>
        <Animated.Text className="font-sans-md text-xs tracking-tagline uppercase text-muted" style={[{ marginTop: 12 }, tagStyle]}>
          Share the load
        </Animated.Text>
      </Animated.View>

      {/* Ticker layer */}
      <Animated.View className="absolute inset-0 items-center justify-center" style={tickerLayerStyle} pointerEvents="none">
        <View style={{ width: CHIP.size, height: CHIP.size, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Animated.View style={[{ width: CHIP.size, height: CHIP.size, borderRadius: CHIP.radius, alignItems: 'center', justifyContent: 'center', backgroundColor: roleColor + CHIP.bgOpacity }, inIconStyle]}>
            <Ionicons name={currentTask?.icon as IoniconsName} size={CHIP.iconSize} color={roleColor} />
          </Animated.View>
        </View>

        <View style={{ width: TEXT_SLOT.width, height: TEXT_SLOT.height, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.Text numberOfLines={1} className="font-sans-md text-xl text-ink text-center" style={[{ letterSpacing: -0.2 }, inTextStyle]}>
            {currentTask?.text}<Text className="text-muted">…</Text>
          </Animated.Text>
        </View>

        <Text className="font-serif text-4xl text-ink" style={{ letterSpacing: -0.3, opacity: 0.35, marginTop: 24 }}>
          Load<Text style={{ fontFamily: 'InstrumentSerif_400Regular_Italic' }}>Share</Text>
        </Text>

        <View className="w-[100px] h-[1.5px] rounded-sm overflow-hidden mt-2.5 bg-line">
          <Animated.View className="h-full rounded-sm bg-ink" style={{ width: loading ? '60%' : '100%' }} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}
