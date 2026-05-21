import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface Props {
  role: string;
  color: string;
  size?: number;
}

const FILL_BY_ROLE: Record<string, number> = {
  planner: 0, organizer: 0.33, reminder: 0.66, executor: 1,
};

export function RoleGlyph({ role, color, size = 14 }: Props) {
  const r  = size / 2 - 1;
  const cx = size / 2;
  const cy = size / 2;
  const fill      = FILL_BY_ROLE[role] ?? 0;
  const angle     = fill * Math.PI * 2;
  const endX      = cx + r * Math.sin(angle);
  const endY      = cy - r * Math.cos(angle);
  const largeArc  = fill > 0.5 ? 1 : 0;

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
