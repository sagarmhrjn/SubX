import SubscriptionCard from '@/components/SubscriptionCard';
import { ALL_SUBSCRIPTIONS } from '@/constants/data';
import { posthog } from '@/lib/posthog';
import { formatCurrency } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SubscriptionContext } from '@/context/SubscriptionContext';
import React, { useContext, useMemo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export interface SearchableSubscriptionListProps {
  subscriptions?: Subscription[];
  headerTitle?: string;
  searchPlaceholder?: string;
  showMetrics?: boolean;
  onSelectSubscription?: (subscription: Subscription) => void;
}

const SearchableSubscriptionList: React.FC<SearchableSubscriptionListProps> = ({
  subscriptions: propSubscriptions,
  headerTitle = 'All Subscriptions',
  searchPlaceholder = 'Search subscriptions, plans, categories...',
  showMetrics = true,
  onSelectSubscription,
}) => {
  const subscriptionContext = useContext(SubscriptionContext);
  const subscriptions =
    propSubscriptions ?? subscriptionContext?.subscriptions ?? ALL_SUBSCRIPTIONS;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);

  // Extract unique categories for filter options
  const filterOptions = useMemo(() => {
    const statuses = [
      { id: 'all', label: 'All' },
      { id: 'status:active', label: 'Active' },
      { id: 'status:paused', label: 'Paused' },
      { id: 'status:cancelled', label: 'Cancelled' },
    ];

    const categorySet = new Set<string>();
    subscriptions.forEach((sub) => {
      if (sub.category) categorySet.add(sub.category.trim());
    });

    const categoryOptions = Array.from(categorySet).map((cat) => ({
      id: `cat:${cat.toLowerCase()}`,
      label: cat,
      categoryName: cat,
    }));

    return [...statuses, ...categoryOptions];
  }, [subscriptions]);

  // Filter subscriptions based on search query and selected filter
  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return subscriptions.filter((sub) => {
      // 1. Check filter pill selection
      if (selectedFilter !== 'all') {
        if (selectedFilter.startsWith('status:')) {
          const targetStatus = selectedFilter.replace('status:', '');
          if ((sub.status?.toLowerCase() || 'active') !== targetStatus) {
            return false;
          }
        } else if (selectedFilter.startsWith('cat:')) {
          const targetCat = selectedFilter.replace('cat:', '');
          if (sub.category?.toLowerCase() !== targetCat) {
            return false;
          }
        }
      }

      // 2. Check search query text
      if (!query) return true;

      const matchesName = sub.name.toLowerCase().includes(query);
      const matchesCategory = sub.category?.toLowerCase().includes(query);
      const matchesPlan = sub.plan?.toLowerCase().includes(query);
      const matchesBilling = sub.billing.toLowerCase().includes(query);
      const matchesPayment = sub.paymentMethod?.toLowerCase().includes(query);

      return (
        matchesName ||
        Boolean(matchesCategory) ||
        Boolean(matchesPlan) ||
        matchesBilling ||
        Boolean(matchesPayment)
      );
    });
  }, [subscriptions, searchQuery, selectedFilter]);

  // Compute metrics for active filtered list
  const metrics = useMemo(() => {
    const count = filteredSubscriptions.length;
    const monthlyTotal = filteredSubscriptions.reduce((acc, sub) => {
      if (sub.status === 'cancelled') return acc;
      const isYearly = sub.billing.toLowerCase().includes('year');
      const monthlyAmount = isYearly ? sub.price / 12 : sub.price;
      return acc + monthlyAmount;
    }, 0);

    return {
      count,
      monthlyTotal,
    };
  }, [filteredSubscriptions]);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleClearSearch = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore
    }
    setSearchQuery('');
  };

  const handleSelectFilter = (filterId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore
    }
    setSelectedFilter(filterId);
    posthog?.capture('subscription_filtered', {
      filter: filterId,
      result_count: filteredSubscriptions.length,
    });
  };

  const handleResetFilters = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignore
    }
    setSearchQuery('');
    setSelectedFilter('all');
  };

  const toggleExpand = (sub: Subscription) => {
    const isExpanding = expandedSubscriptionId !== sub.id;
    try {
      Haptics.selectionAsync();
    } catch {
      // Ignore
    }
    posthog?.capture('subscription_details_toggled', {
      is_expanded: isExpanding,
      subscription_name: sub.name,
      billing_cycle: sub.billing,
      subscription_category: sub.category ?? sub.plan ?? 'unknown',
      subscription_status: sub.status ?? 'unknown',
      source: 'searchable_subscription_list',
    });
    setExpandedSubscriptionId(isExpanding ? sub.id : null);
    if (onSelectSubscription) {
      onSelectSubscription(sub);
    }
  };

  return (
    <View className="flex-1">
      {/* Search Input Bar */}
      <View className="mb-3 flex-row items-center rounded-2xl border border-border bg-card px-4 py-3">
        <Ionicons
          name="search-outline"
          size={20}
          color="#081126"
          style={{ opacity: 0.6, marginRight: 8 }}
        />
        <TextInput
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder={searchPlaceholder}
          placeholderTextColor="rgba(0, 0, 0, 0.4)"
          className="flex-1 font-sans-medium text-base text-primary"
          clearButtonMode="never"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={handleClearSearch}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="p-1"
          >
            <Ionicons name="close-circle" size={18} color="rgba(0,0,0,0.4)" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips Horizontal Scroll */}
      <View className="mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 pr-4"
        >
          {filterOptions.map((option) => {
            const isActive = selectedFilter === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => handleSelectFilter(option.id)}
                activeOpacity={0.7}
                className={`rounded-full border px-4 py-2 ${
                  isActive
                    ? 'border-accent bg-accent'
                    : 'border-border bg-card'
                }`}
              >
                <Text
                  className={`text-sm font-sans-semibold ${
                    isActive ? 'text-white' : 'text-primary'
                  }`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Metrics Bar */}
      {showMetrics && (
        <View className="mb-4 flex-row items-center justify-between rounded-xl bg-muted/60 px-4 py-2.5">
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="layers-outline" size={16} color="#081126" style={{ opacity: 0.7 }} />
            <Text className="text-sm font-sans-semibold text-primary">
              {metrics.count} {metrics.count === 1 ? 'Subscription' : 'Subscriptions'}
            </Text>
          </View>
          <Text className="text-sm font-sans-medium text-muted-foreground">
            Est. <Text className="font-sans-bold text-primary">{formatCurrency(metrics.monthlyTotal)}</Text>/mo
          </Text>
        </View>
      )}

      {/* Subscription List */}
      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        extraData={expandedSubscriptionId}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <View className="h-3.5" />}
        contentContainerClassName="pb-36"
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => toggleExpand(item)}
          />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-4">
            <View className="mb-4 size-16 items-center justify-center rounded-full bg-card border border-border">
              <Ionicons name="search-outline" size={30} color="#ea7a53" />
            </View>
            <Text className="text-xl font-sans-bold text-primary text-center">
              No subscriptions found
            </Text>
            <Text className="mt-2 text-center text-sm font-sans-medium text-muted-foreground max-w-[280px]">
              {searchQuery
                ? `No results matching "${searchQuery}". Try another keyword or reset filters.`
                : 'No subscriptions match the selected filter.'}
            </Text>
            {(searchQuery.length > 0 || selectedFilter !== 'all') && (
              <TouchableOpacity
                onPress={handleResetFilters}
                activeOpacity={0.7}
                className="mt-6 rounded-2xl bg-accent px-6 py-3"
              >
                <Text className="font-sans-bold text-sm text-primary">
                  Clear Search & Filters
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
};

export default SearchableSubscriptionList;
