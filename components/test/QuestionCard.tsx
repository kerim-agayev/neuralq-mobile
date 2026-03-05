import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useThemeColors } from '../../theme';
import { TestQuestion } from '../../types';
import Card from '../ui/Card';

interface QuestionCardProps {
  question: TestQuestion;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const imageSize = width - 80; // 40px padding on each side

  return (
    <Card variant="default" style={styles.card}>
      {/* Question text */}
      {question.content ? (
        <Text style={[styles.questionText, { color: colors.text }]}>
          {question.content}
        </Text>
      ) : null}

      {/* Question image (for spatial/visual questions) */}
      {question.imageUrl ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: question.imageUrl }}
            style={[styles.image, { width: imageSize, height: imageSize * 0.6 }]}
            contentFit="contain"
            transition={300}
          />
        </View>
      ) : null}

      {/* If no content and no image, show category hint */}
      {!question.content && !question.imageUrl && (
        <Text style={[styles.hint, { color: colors.textDim }]}>
          Choose the correct answer below
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  questionText: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  image: {
    borderRadius: 8,
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
  },
});
