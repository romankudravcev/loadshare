import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  ComponentProps,
} from "react";
import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  SharedValue,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { scheduleOnRN } from "react-native-worklets";
import { useApp } from "../../AppContext";
import {
  TIMING,
  CHIP,
  TEXT_SLOT,
  ANIM,
  SPRING,
  ALL_TASKS,
  StartupTask,
} from "../../constants/startup";
import { LSMark, Palette, ARC_LEN } from "./LSMark";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

const EASE_OUT = Easing.out(Easing.cubic);
const EASE_IN = Easing.in(Easing.cubic);

type Props = { onComplete: () => void };

export function StartupScreen({ onComplete }: Props) {
  const { palette, loading } = useApp() as {
    palette: Palette;
    loading: boolean;
  };

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const queue = useMemo<StartupTask[]>(() => {
    const shuffled = [...ALL_TASKS].sort(() => Math.random() - 0.5);
    return [...shuffled, ...shuffled];
  }, []);

  const [phase, setPhase] = useState<"logo" | "ticker">("logo");
  const [, forceUpdate] = useState(0);
  const ticksAfterDone = useRef(0);
  const exitScheduled = useRef(false);
  const incomingIdx = useRef(0);

  // SVG values (UI-thread via useAnimatedProps in LSMark)
  const arc0 = useSharedValue(ARC_LEN);
  const arc1 = useSharedValue(ARC_LEN);
  const arc2 = useSharedValue(ARC_LEN);
  const arc3 = useSharedValue(ARC_LEN);
  const arcValues: SharedValue<number>[] = [arc0, arc1, arc2, arc3];
  const pipValue = useSharedValue(0);

  // Layer / text values
  const wordAnim = useSharedValue(0);
  const tagAnim = useSharedValue(0);
  const logoLayer = useSharedValue(1);
  const tickerLayer = useSharedValue(0);
  const screenFade = useSharedValue(1);
  const inOpacity = useSharedValue<number>(0);
  const inSlide = useSharedValue<number>(ANIM.slideFrom);
  const inScale = useSharedValue<number>(ANIM.inScaleFrom);

  const screenFadeStyle = useAnimatedStyle(() => ({
    opacity: screenFade.value,
  }));
  const logoLayerStyle = useAnimatedStyle(() => ({ opacity: logoLayer.value }));
  const tickerLayerStyle = useAnimatedStyle(() => ({
    opacity: tickerLayer.value,
  }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: wordAnim.value,
    transform: [{ translateY: (1 - wordAnim.value) * ANIM.wordTranslateY }],
  }));
  const tagStyle = useAnimatedStyle(() => ({ opacity: tagAnim.value }));
  const inIconStyle = useAnimatedStyle(() => ({
    opacity: inOpacity.value,
    transform: [{ scale: inScale.value }],
  }));
  const inTextStyle = useAnimatedStyle(() => ({
    opacity: inOpacity.value,
    transform: [
      { translateY: inSlide.value },
      { scale: inScale.value },
    ] as ViewStyle["transform"],
  }));

  // ── Helpers ───────────────────────────────────────────────────

  const resetIncoming = () => {
    inOpacity.value = 0;
    inSlide.value = ANIM.slideFrom;
    inScale.value = ANIM.inScaleFrom;
  };

  const animateIncoming = () => {
    inOpacity.value = withTiming(1, {
      duration: TIMING.initialIncoming,
      easing: EASE_OUT,
    });
    inSlide.value = withTiming(0, {
      duration: TIMING.initialIncoming + 20,
      easing: EASE_OUT,
    });
    inScale.value = withTiming(1, {
      duration: TIMING.initialIncoming + 20,
      easing: EASE_OUT,
    });
  };

  const doExit = () => {
    if (exitScheduled.current) return;
    exitScheduled.current = true;
    const cb = onCompleteRef.current;
    screenFade.value = withTiming(
      0,
      { duration: TIMING.exitFade, easing: EASE_OUT },
      (finished) => {
        if (finished && cb) scheduleOnRN(cb);
      },
    );
  };

  const updateContent = () => {
    incomingIdx.current = (incomingIdx.current + 1) % queue.length;
    forceUpdate((n) => n + 1);
  };

  // Fade out → swap content → fade in (no double-buffer race condition)
  const advanceTick = () => {
    if (!loading) ticksAfterDone.current += 1;
    inOpacity.value = withTiming(
      0,
      { duration: TIMING.tickFadeOut, easing: EASE_IN },
      (finished) => {
        if (!finished) return;
        inSlide.value = ANIM.slideFrom;
        inScale.value = ANIM.inScaleFrom;
        scheduleOnRN(updateContent);
        inOpacity.value = withDelay(
          TIMING.tickBuffer,
          withTiming(1, { duration: TIMING.tickFadeIn, easing: EASE_OUT }),
        );
        inSlide.value = withDelay(
          TIMING.tickBuffer,
          withTiming(0, {
            duration: TIMING.tickSlideDuration,
            easing: EASE_OUT,
          }),
        );
        inScale.value = withDelay(
          TIMING.tickBuffer,
          withTiming(1, {
            duration: TIMING.tickSlideDuration,
            easing: EASE_OUT,
          }),
        );
      },
    );
  };

  // ── Logo phase ────────────────────────────────────────────────
  useEffect(() => {
    arcValues.forEach((sv, i) => {
      sv.value = withDelay(
        i * TIMING.arcStagger,
        withTiming(0, { duration: TIMING.arcDuration, easing: EASE_OUT }),
      );
    });
    const t1 = setTimeout(() => {
      pipValue.value = withSpring(1, {
        damping: SPRING.damping,
        stiffness: SPRING.stiffness,
      });
    }, TIMING.pipDelay);
    const t2 = setTimeout(() => {
      wordAnim.value = withTiming(1, {
        duration: TIMING.wordDuration,
        easing: EASE_OUT,
      });
    }, TIMING.wordDelay);
    const t3 = setTimeout(() => {
      tagAnim.value = withTiming(1, {
        duration: TIMING.taglineDuration,
        easing: EASE_OUT,
      });
    }, TIMING.taglineDelay);
    const t4 = setTimeout(() => {
      setPhase("ticker");
      logoLayer.value = withTiming(0, {
        duration: TIMING.layerCrossfade,
        easing: EASE_OUT,
      });
      tickerLayer.value = withTiming(1, {
        duration: TIMING.layerCrossfade,
        easing: EASE_OUT,
      });
      resetIncoming();
      animateIncoming();
    }, TIMING.logoHold);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  // ── Ticker loop ───────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "ticker") return;
    const id = setInterval(() => {
      if (!loading && ticksAfterDone.current >= TIMING.minTicksAfterLoad) {
        clearInterval(id);
        setTimeout(doExit, TIMING.exitDelay);
        return;
      }
      advanceTick();
    }, TIMING.tick);
    return () => clearInterval(id);
  }, [phase, loading]);

  const currentTask = queue[incomingIdx.current];
  const roleColor = palette[currentTask?.role] ?? palette.muted;

  return (
    <Animated.View
      style={[styles.root, { backgroundColor: palette.bg }, screenFadeStyle]}
    >
      {/* Logo layer */}
      <Animated.View
        style={[styles.layer, logoLayerStyle]}
        pointerEvents="none"
      >
        <LSMark palette={palette} arcValues={arcValues} pipValue={pipValue} />
        <Animated.Text
          style={[styles.wordmark, { color: palette.ink }, wordStyle]}
        >
          Load<Text style={styles.italic}>Share</Text>
        </Animated.Text>
        <Animated.Text
          style={[styles.tagline, { color: palette.muted }, tagStyle]}
        >
          Share the load
        </Animated.Text>
      </Animated.View>

      {/* Ticker layer */}
      <Animated.View
        style={[styles.layer, tickerLayerStyle]}
        pointerEvents="none"
      >
        <View style={styles.iconSlot}>
          <Animated.View
            style={[
              styles.bigChip,
              { backgroundColor: roleColor + CHIP.bgOpacity },
              inIconStyle,
            ]}
          >
            <Ionicons
              name={currentTask?.icon as IoniconsName}
              size={CHIP.iconSize}
              color={roleColor}
            />
          </Animated.View>
        </View>

        <View style={styles.textSlot}>
          <Animated.Text
            numberOfLines={1}
            style={[styles.taskText, { color: palette.ink }, inTextStyle]}
          >
            {currentTask?.text}
            <Text style={{ color: palette.muted }}>…</Text>
          </Animated.Text>
        </View>

        <Text style={[styles.wordmarkSm, { color: palette.ink }]}>
          Load<Text style={styles.italic}>Share</Text>
        </Text>

        <View style={[styles.progressBg, { backgroundColor: palette.line }]}>
          <Animated.View
            style={[
              styles.progressFill,
              { backgroundColor: palette.ink, width: loading ? "60%" : "100%" },
            ]}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center" },
  layer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: {
    fontFamily: "InstrumentSerif_400Regular",
    fontSize: 38,
    letterSpacing: -0.4,
    marginTop: 20,
  },
  wordmarkSm: {
    fontFamily: "InstrumentSerif_400Regular",
    fontSize: 28,
    letterSpacing: -0.3,
    opacity: 0.35,
    marginTop: 24,
  },
  italic: { fontFamily: "InstrumentSerif_400Regular_Italic" },
  tagline: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    marginTop: 12,
  },
  iconSlot: {
    width: CHIP.size,
    height: CHIP.size,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  bigChip: {
    width: CHIP.size,
    height: CHIP.size,
    borderRadius: CHIP.radius,
    alignItems: "center",
    justifyContent: "center",
  },
  textSlot: {
    width: TEXT_SLOT.width,
    height: TEXT_SLOT.height,
    alignItems: "center",
    justifyContent: "center",
  },
  taskText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 17,
    letterSpacing: -0.2,
    textAlign: "center",
  },
  progressBg: {
    width: 100,
    height: 1.5,
    borderRadius: 1,
    overflow: "hidden",
    marginTop: 10,
  },
  progressFill: { height: "100%", borderRadius: 1 },
});
