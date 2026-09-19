import SearchableSubscriptionList from "@/components/SearchableSubscriptionList";
import { ALL_SUBSCRIPTIONS } from "@/constants/data";
import { styled } from "nativewind";
import { Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff9e3" }}
      className="flex-1 bg-background p-5"
      edges={["top"]}
    >
      <View className="mb-4">
        <Text className="text-3xl font-sans-extrabold text-primary">
          Subscriptions
        </Text>
        <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
          Manage, search, and track all your recurring payments
        </Text>
      </View>

      <SearchableSubscriptionList subscriptions={ALL_SUBSCRIPTIONS} />
    </SafeAreaView>
  );
};

export default Subscriptions;