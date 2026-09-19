import React from 'react';
import { Text, View } from 'react-native';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <View className="auth-brand-block items-center">
      {/* Brand logo & wordmark */}
      <View className="auth-logo-wrap flex-row items-center gap-3">
        <View className="auth-logo-mark size-14 items-center justify-center rounded-2xl bg-accent">
          <Text className="auth-logo-mark-text font-sans-extrabold text-2xl text-background">
            R
          </Text>
        </View>
        <View>
          <Text className="auth-wordmark font-sans-extrabold text-3xl text-primary">
            SubX
          </Text>
          <Text className="auth-wordmark-sub -mt-1 font-sans-semibold text-xs tracking-wider uppercase text-muted-foreground">
            SMART BILLING
          </Text>
        </View>
      </View>

      {/* Screen Title & Subtitle */}
      <Text className="auth-title mt-2 font-sans-bold text-3xl text-primary text-center">
        {title}
      </Text>
      <Text className="auth-subtitle mt-2 max-w-[320px] font-sans-medium text-base text-muted-foreground text-center">
        {subtitle}
      </Text>
    </View>
  );
};

export default AuthHeader;
