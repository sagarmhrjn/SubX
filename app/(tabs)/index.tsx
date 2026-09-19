import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE, HOME_USER, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { posthog } from "@/lib/posthog";
import { formatCurrency } from "@/lib/utils";
import { useSubscriptions } from "@/context/SubscriptionContext";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { router } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
    const { user } = useUser();
    const { homeSubscriptions, addSubscription } = useSubscriptions();
    const [expandedSubscriptionId, setExpandedSubscriptionId] = React.useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

    const displayName =
        user?.fullName ||
        user?.firstName ||
        user?.primaryEmailAddress?.emailAddress?.split('@')[0] ||
        HOME_USER.name;

    const avatarSource = user?.imageUrl ? { uri: user.imageUrl } : images.avatar;

    const handleCreateSubscription = (newSub: Subscription) => {
        addSubscription(newSub);
        posthog?.capture('subscription_created', {
            subscription_name: newSub.name,
            category: newSub.category ?? 'unknown',
            billing: newSub.billing,
            price: newSub.price,
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-background p-5">
                <FlatList
                    ListHeaderComponent={() => (
                        <>
                            <View className="home-header">
                                <View className="home-user">
                                    <Image source={avatarSource} className="home-avatar"></Image>
                                    <Text className="home-user-name">{displayName}</Text>
                                </View>
                                <Pressable
                                    onPress={() => setIsCreateModalOpen(true)}
                                    hitSlop={8}
                                >
                                    <Image source={icons.add} className="home-add-icon" />
                                </Pressable>
                            </View>
                            <View className="home-balance-card">
                                <Text className="home-balanace-label">Balance</Text>
                                <View className="home-balance-row">
                                    <Text className="home-balance-amount">{formatCurrency(HOME_BALANCE.amount)}</Text>
                                    <Text className="home-balance-date">{dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}</Text>
                                </View>
                            </View>

                            <View className="mb-5">
                                <ListHeading title="Upcoming" />
                                <FlatList
                                    data={UPCOMING_SUBSCRIPTIONS}
                                    renderItem={({ item }) => (<UpcomingSubscriptionCard {...item} />)}
                                    keyExtractor={(item) => item.id}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    ListEmptyComponent={<Text className="home-empty-state">No upcoming renewals yet.</Text>}
                                />
                            </View>

                            <ListHeading
                                title="All Subscriptions"
                                onPressViewAll={() => router.push('/(tabs)/subscriptions')}
                            />

                        </>
                    )}
                    data={homeSubscriptions}
                    keyExtractor={(item) => item.id}
                    extraData={expandedSubscriptionId}
                    ItemSeparatorComponent={() => <View className="h-4" />}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<Text className="home-empty-state">No subscriptions yet.</Text>}
                    contentContainerClassName="pb-30"
                    renderItem={({ item }) => (
                        <SubscriptionCard {...item}
                            expanded={expandedSubscriptionId === item.id}
                            onPress={() => {
                                const isExpanded = expandedSubscriptionId !== item.id;
                                posthog?.capture('subscription_details_toggled', {
                                    is_expanded: isExpanded,
                                    billing_cycle: item.billing,
                                    subscription_category: item.category ?? item.plan ?? 'unknown',
                                    subscription_status: item.status ?? 'unknown',
                                });
                                setExpandedSubscriptionId(isExpanded ? item.id : null);
                            }}
                        />
                    )}
                />

                <CreateSubscriptionModal
                    visible={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreateSubscription={handleCreateSubscription}
                />
        </SafeAreaView>
    );
}