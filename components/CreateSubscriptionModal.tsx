import { icons } from '@/constants/icons';
import { clsx } from 'clsx';
import dayjs from 'dayjs';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateSubscription: (subscription: Subscription) => void;
}

const CATEGORIES = [
  'Entertainment',
  'AI Tools',
  'Developer Tools',
  'Design',
  'Productivity',
  'Cloud',
  'Music',
  'Other',
] as const;

type Category = typeof CATEGORIES[number];
type Frequency = 'Monthly' | 'Yearly';

const CATEGORY_COLORS: Record<Category, string> = {
  Entertainment: '#b8f0d8',
  'AI Tools': '#b8d4e3',
  'Developer Tools': '#e8def8',
  Design: '#ffd8cc',
  Productivity: '#f7e8d0',
  Cloud: '#d2e5fa',
  Music: '#d1f4e0',
  Other: '#e8eaed',
};

const CreateSubscriptionModal: React.FC<CreateSubscriptionModalProps> = ({
  visible,
  onClose,
  onCreateSubscription,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('Monthly');
  const [category, setCategory] = useState<Category>('Entertainment');

  const parsedPrice = parseFloat(price);
  const isValid = name.trim().length > 0 && !isNaN(parsedPrice) && parsedPrice > 0;

  const resetForm = () => {
    setName('');
    setPrice('');
    setFrequency('Monthly');
    setCategory('Entertainment');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!isValid) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignore
    }

    const now = dayjs();
    const renewalDate = frequency === 'Yearly'
      ? now.add(1, 'year').toISOString()
      : now.add(1, 'month').toISOString();

    const newSubscription: Subscription = {
      id: `sub_${Date.now()}`,
      name: name.trim(),
      price: Number(parsedPrice.toFixed(2)),
      currency: 'USD',
      billing: frequency,
      category,
      status: 'active',
      startDate: now.toISOString(),
      renewalDate,
      icon: icons.wallet,
      color: CATEGORY_COLORS[category] || '#e8def8',
    };

    onCreateSubscription(newSubscription);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="modal-overlay justify-end"
      >
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={handleClose}
        />
        <View className="modal-container">
          {/* Header */}
          <View className="modal-header">
            <Text className="modal-title">New Subscription</Text>
            <TouchableOpacity
              onPress={handleClose}
              className="modal-close"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Close modal"
            >
              <Text className="modal-close-text">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          <ScrollView
            contentContainerClassName="modal-body pb-10"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Field: Name */}
            <View className="gap-2">
              <Text className="auth-label">Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Netflix, Spotify"
                placeholderTextColor="rgba(8, 17, 38, 0.4)"
                className="auth-input"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* Field: Price */}
            <View className="gap-2">
              <Text className="auth-label">Price</Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                placeholderTextColor="rgba(8, 17, 38, 0.4)"
                keyboardType="decimal-pad"
                className="auth-input"
              />
            </View>

            {/* Field: Frequency */}
            <View className="gap-2">
              <Text className="auth-label">Frequency</Text>
              <View className="picker-row">
                <TouchableOpacity
                  onPress={() => {
                    setFrequency('Monthly');
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                  }}
                  className={clsx(
                    'picker-option',
                    frequency === 'Monthly' && 'picker-option-active'
                  )}
                  activeOpacity={0.7}
                >
                  <Text
                    className={clsx(
                      'picker-option-text',
                      frequency === 'Monthly' && 'picker-option-text-active'
                    )}
                  >
                    Monthly
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setFrequency('Yearly');
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                  }}
                  className={clsx(
                    'picker-option',
                    frequency === 'Yearly' && 'picker-option-active'
                  )}
                  activeOpacity={0.7}
                >
                  <Text
                    className={clsx(
                      'picker-option-text',
                      frequency === 'Yearly' && 'picker-option-text-active'
                    )}
                  >
                    Yearly
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Field: Category */}
            <View className="gap-2">
              <Text className="auth-label">Category</Text>
              <View className="category-scroll">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => {
                        setCategory(cat);
                        try {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        } catch {}
                      }}
                      className={clsx(
                        'category-chip',
                        isSelected && 'category-chip-active'
                      )}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={clsx(
                          'category-chip-text',
                          isSelected && 'category-chip-text-active'
                        )}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!isValid}
              className={clsx(
                'auth-button',
                !isValid && 'auth-button-disabled'
              )}
              activeOpacity={0.8}
            >
              <Text className="auth-button-text">Add Subscription</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateSubscriptionModal;
