import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import SearchableSubscriptionList from "@/components/SearchableSubscriptionList";
import { icons } from "@/constants/icons";
import { useSubscriptions } from "@/context/SubscriptionContext";
import { posthog } from "@/lib/posthog";
import { styled } from "nativewind";
import React, { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const { subscriptions, addSubscription } = useSubscriptions();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateSubscription = (newSub: Subscription) => {
    addSubscription(newSub);
    posthog?.capture('subscription_created', {
      subscription_name: newSub.name,
      category: newSub.category ?? 'unknown',
      billing: newSub.billing,
      price: newSub.price,
      source: 'subscriptions_tab',
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff9e3" }}
      className="flex-1 bg-background p-5"
      edges={["top"]}
    >
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-3xl font-sans-extrabold text-primary">
            Subscriptions
          </Text>
          <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
            Manage, search, and track all your recurring payments
          </Text>
        </View>
        <Pressable
          onPress={() => setIsCreateModalOpen(true)}
          hitSlop={8}
        >
          <Image source={icons.add} className="home-add-icon" />
        </Pressable>
      </View>

      <SearchableSubscriptionList subscriptions={subscriptions} />

      <CreateSubscriptionModal
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSubscription={handleCreateSubscription}
      />
    </SafeAreaView>
  );
};

export default Subscriptions;