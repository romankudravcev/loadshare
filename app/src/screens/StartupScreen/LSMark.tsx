import React from "react";
import Animated, {
  useAnimatedProps,
  SharedValue,
} from "react-native-reanimated";
import Svg, { Path, Circle } from "react-native-svg";
import { ARC_SEGS, MARK } from "../../constants/startup";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const MARK_R = MARK.size * MARK.radiusFactor;
export const ARC_LEN = (Math.PI * 2 * MARK_R) / 4;
const STROKE_W = Math.max(MARK.strokeMin, MARK.size * MARK.strokeFactor);

// Matches the shape of PALETTES.warm/dusk/mono in tokens.js
export type Palette = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  ink: string;
  inkSoft: string;
  muted: string;
  line: string;
  lineStrong: string;
  accent: string;
  accent2: string;
  accent3: string;
  warn: string;
  planner: string;
  organizer: string;
  reminder: string;
  executor: string;
};

// ── Internal sub-components ───────────────────────────────────

type ArcSegmentProps = {
  sv: SharedValue<number>;
  color: string;
  from: number;
  to: number;
};

function ArcSegment({ sv, color, from, to }: ArcSegmentProps) {
  const cx = MARK.size / 2;
  const cy = MARK.size / 2;
  const ang = (deg: number) => (deg * Math.PI) / 180;
  const x1 = cx + MARK_R * Math.cos(ang(from));
  const y1 = cy + MARK_R * Math.sin(ang(from));
  const x2 = cx + MARK_R * Math.cos(ang(to));
  const y2 = cy + MARK_R * Math.sin(ang(to));
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: sv.value,
  }));
  return (
    <AnimatedPath
      d={`M ${x1} ${y1} A ${MARK_R} ${MARK_R} 0 0 1 ${x2} ${y2}`}
      fill="none"
      stroke={color}
      strokeWidth={STROKE_W}
      strokeLinecap="round"
      strokeDasharray={ARC_LEN}
      animatedProps={animatedProps}
    />
  );
}

type PipDotProps = { sv: SharedValue<number>; fill: string };

function PipDot({ sv, fill }: PipDotProps) {
  const cx = MARK.size / 2;
  const animatedProps = useAnimatedProps(() => ({ opacity: sv.value }));
  return (
    <AnimatedCircle
      cx={cx}
      cy={cx}
      r={MARK.size * MARK.pipRadiusFactor}
      fill={fill}
      animatedProps={animatedProps}
    />
  );
}

// ── Exported component ────────────────────────────────────────

export type LSMarkProps = {
  palette: Palette;
  arcValues: SharedValue<number>[];
  pipValue: SharedValue<number>;
};

export function LSMark({ palette, arcValues, pipValue }: LSMarkProps) {
  return (
    <Svg width={MARK.size} height={MARK.size}>
      {ARC_SEGS.map((seg, i) => (
        <ArcSegment
          key={seg.role}
          sv={arcValues[i]}
          color={palette[seg.role]}
          from={seg.from}
          to={seg.to}
        />
      ))}
      <PipDot sv={pipValue} fill={palette.ink} />
    </Svg>
  );
}
