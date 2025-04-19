import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';

export default function AppIcon({ size = 1024, backgroundColor = '#FFFFFF' }) {
  const strokeWidth = size * 0.08;
  const circleRadius = size * 0.35;
  const handleWidth = strokeWidth;
  const handleHeight = size * 0.25;
  
  return (
    <View style={{ width: size, height: size, backgroundColor }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Circle part of magnifying glass */}
        <Circle
          cx={size / 2}
          cy={size / 2 - handleHeight / 3}
          r={circleRadius}
          stroke="black"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Handle part of magnifying glass */}
        <Rect
          x={size / 2 - handleWidth / 2}
          y={size / 2 + circleRadius - handleHeight / 3}
          width={handleWidth}
          height={handleHeight}
          fill="black"
        />
      </Svg>
    </View>
  );
} 