import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { memberBg, memberInk } from '../tokens';

// ── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ member, size = 28, ring = false, style }) {
  if (!member) return null;
  const bg = memberBg(member.hue);
  const ink = memberInk(member.hue);
  return (
    <View style={[{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: bg,
      alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      ...(ring ? { borderWidth: 2, borderColor: '#fff' } : {}),
    }, style]}>
      <Text style={{
        fontFamily: 'DMSans_600SemiBold',
        fontSize: size * 0.42,
        color: ink,
        lineHeight: size * 0.5,
      }}>{member.short}</Text>
    </View>
  );
}

// ── RoleGlyph — SVG circle with progressive fill ─────────────────────────────
export function RoleGlyph({ role, color, size = 14 }) {
  const r = size / 2 - 1;
  const cx = size / 2;
  const cy = size / 2;
  const fill = { planner: 0, organizer: 0.33, reminder: 0.66, executor: 1 }[role] ?? 0;

  const angle = fill * Math.PI * 2;
  const endX = cx + r * Math.sin(angle);
  const endY = cy - r * Math.cos(angle);
  const largeArc = fill > 0.5 ? 1 : 0;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <Circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={1.2} />
      {fill > 0 && (
        <Path
          d={`M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY} Z`}
          fill={color}
        />
      )}
    </Svg>
  );
}

// ── WeightBars — 5-step effort indicator ─────────────────────────────────────
export function WeightBars({ value, color = '#000', size = 'sm', muted }) {
  const dims = {
    xs: { w: 3, h: 6,  gap: 1.5 },
    sm: { w: 3, h: 8,  gap: 2 },
    md: { w: 4, h: 12, gap: 2.5 },
  }[size] || { w: 3, h: 8, gap: 2 };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: dims.gap }}>
      {[1, 2, 3, 4, 5].map(i => {
        const active = i <= value;
        const h = dims.h * (0.4 + i * 0.12);
        return (
          <View key={i} style={{
            width: dims.w, height: h, borderRadius: 1,
            backgroundColor: active ? color : (muted || color),
            opacity: active ? 1 : 0.18,
          }} />
        );
      })}
    </View>
  );
}

// ── Kicker — uppercase label ──────────────────────────────────────────────────
export function Kicker({ children, color, style }) {
  return (
    <Text style={[{
      fontFamily: 'DMSans_500Medium',
      fontSize: 11, letterSpacing: 1.4,
      textTransform: 'uppercase', color,
    }, style]}>{children}</Text>
  );
}

// ── Display — serif heading ───────────────────────────────────────────────────
export function Display({ children, size = 34, style }) {
  return (
    <Text style={[{
      fontFamily: 'InstrumentSerif_400Regular',
      fontSize: size, lineHeight: size * 1.08,
      letterSpacing: -0.5,
    }, style]}>{children}</Text>
  );
}

// ── Icon — SF-style SVG icon set ─────────────────────────────────────────────
export function Icon({ name, size = 22, color = '#000' }) {
  const stroke = { stroke: color, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
  const icons = {
    home: (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M3 10.5 12 3l9 7.5" {...stroke} />
        <Path d="M5 9v11h14V9" {...stroke} />
      </Svg>
    ),
    plus: (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth={1.6} />
        <Path d="M12 8v8M8 12h8" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      </Svg>
    ),
    plusFilled: (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle cx="12" cy="12" r="9" fill={color} />
        <Path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" />
      </Svg>
    ),
    inbox: (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M3 13h5l1 3h6l1-3h5" {...stroke} />
        <Path d="M5 5h14l2 8v6H3v-6l2-8Z" {...stroke} />
      </Svg>
    ),
    chev: (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="m9 6 6 6-6 6" {...stroke} />
      </Svg>
    ),
    back: (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="m15 6-6 6 6 6" {...stroke} />
      </Svg>
    ),
    bell: (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M6 16c-1 0-1-1-1-1l1-4a6 6 0 0 1 12 0l1 4s0 1-1 1H6Z" {...stroke} />
        <Path d="M10 20a2 2 0 0 0 4 0" {...stroke} />
      </Svg>
    ),
    flag: (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M5 21V4" {...stroke} />
        <Path d="M5 4h12l-2 4 2 4H5" {...stroke} />
      </Svg>
    ),
    check: (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="m5 12 5 5 9-11" {...stroke} />
      </Svg>
    ),
    handoff: (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M3 12h13" {...stroke} />
        <Path d="m13 7 5 5-5 5" {...stroke} />
      </Svg>
    ),
    dots: (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle cx="5" cy="12" r="1.2" fill={color} />
        <Circle cx="12" cy="12" r="1.2" fill={color} />
        <Circle cx="19" cy="12" r="1.2" fill={color} />
      </Svg>
    ),
  };
  return icons[name] || null;
}

// ── Dot separator ─────────────────────────────────────────────────────────────
export function Dot({ color }) {
  return (
    <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: color, alignSelf: 'center' }} />
  );
}
