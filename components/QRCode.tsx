import React from 'react';
import { View, StyleSheet } from 'react-native';
import QRCodeSVG from 'react-native-qrcode-svg';
import { colors } from '@/constants/colors';

interface QRCodeProps {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

export const QRCodeDisplay: React.FC<QRCodeProps> = ({
  value,
  size = 200,
  color = colors.text,
  backgroundColor = colors.card
}) => {
  return (
    <View style={styles.container}>
      <QRCodeSVG
        value={value}
        size={size}
        color={color}
        backgroundColor={backgroundColor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: colors.card,
    borderRadius: 8,
  },
});