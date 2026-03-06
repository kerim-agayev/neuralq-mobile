import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import { useThemeColors } from '../../theme';
import { useTranslation } from 'react-i18next';

interface SpiderChartProps {
  spatial: number | null;
  logic: number | null;
  verbal: number | null;
  memory: number | null;
  speed: number | null;
}

export default function SpiderChart({
  spatial,
  logic,
  verbal,
  memory,
  speed,
}: SpiderChartProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();

  const size = Math.min(screenWidth * 0.56, 260);
  const center = size / 2;
  const maxRadius = size / 2 - size * 0.14;
  const levels = 4;

  // Only include categories that have data
  const allCategories = [
    { key: 'spatial', label: t('result.spatial'), value: spatial },
    { key: 'logic', label: t('result.logic'), value: logic },
    { key: 'verbal', label: t('result.verbal'), value: verbal },
    { key: 'memory', label: t('result.memory'), value: memory },
    { key: 'speed', label: t('result.speed'), value: speed },
  ];

  const categories = allCategories.filter(
    (c) => c.value != null && c.value > 0,
  );
  const skippedCount = allCategories.length - categories.length;

  if (categories.length < 3) {
    // Not enough data for a spider chart
    return (
      <View style={styles.fallback}>
        <Text style={[styles.fallbackText, { color: colors.textDim }]}>
          Not enough category data for chart
        </Text>
      </View>
    );
  }

  const numSides = categories.length;
  const angleStep = (2 * Math.PI) / numSides;
  const startAngle = -Math.PI / 2; // Start from top

  // Get point on chart for a given category index and value (0-100)
  const getPoint = (index: number, value: number) => {
    const angle = startAngle + index * angleStep;
    const r = (value / 100) * maxRadius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Grid lines (concentric polygons)
  const gridPolygons = Array.from({ length: levels }, (_, level) => {
    const ratio = (level + 1) / levels;
    const points = Array.from({ length: numSides }, (_, i) => {
      const p = getPoint(i, ratio * 100);
      return `${p.x},${p.y}`;
    }).join(' ');
    return points;
  });

  // Data polygon
  const dataPoints = categories.map((cat, i) => {
    const p = getPoint(i, cat.value!);
    return `${p.x},${p.y}`;
  });

  // Axis lines
  const axes = categories.map((_, i) => {
    const p = getPoint(i, 100);
    return { x2: p.x, y2: p.y };
  });

  // Label positions (slightly outside the chart)
  const labelPositions = categories.map((cat, i) => {
    const p = getPoint(i, 118);
    return { ...p, label: cat.label, value: cat.value! };
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Grid */}
        {gridPolygons.map((points, i) => (
          <Polygon
            key={`grid-${i}`}
            points={points}
            fill="none"
            stroke={colors.border}
            strokeWidth={1}
            opacity={0.5}
          />
        ))}

        {/* Axes */}
        {axes.map((axis, i) => (
          <Line
            key={`axis-${i}`}
            x1={center}
            y1={center}
            x2={axis.x2}
            y2={axis.y2}
            stroke={colors.border}
            strokeWidth={1}
            opacity={0.3}
          />
        ))}

        {/* Data polygon */}
        <Polygon
          points={dataPoints.join(' ')}
          fill={colors.primary}
          fillOpacity={0.2}
          stroke={colors.primary}
          strokeWidth={2}
        />

        {/* Data points */}
        {categories.map((cat, i) => {
          const p = getPoint(i, cat.value!);
          return (
            <Circle
              key={`dot-${i}`}
              cx={p.x}
              cy={p.y}
              r={4}
              fill={colors.primary}
            />
          );
        })}

        {/* Labels */}
        {labelPositions.map((lp, i) => (
          <SvgText
            key={`label-${i}`}
            x={lp.x}
            y={lp.y}
            fill={colors.textSecondary}
            fontSize={10}
            fontWeight="600"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {lp.label}
          </SvgText>
        ))}
      </Svg>
      {skippedCount > 0 && (
        <Text style={[styles.skippedNote, { color: colors.textDim }]}>
          {t('result.categoriesSkipped', { count: skippedCount })}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
  },
  fallback: {
    alignItems: 'center',
    padding: 20,
  },
  fallbackText: {
    fontSize: 13,
  },
  skippedNote: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 6,
    textAlign: 'center',
  },
});
