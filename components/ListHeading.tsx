import { Text, TouchableOpacity, View } from 'react-native'

const ListHeading = ({title, onPressViewAll, showAction = true}: ListHeadingProps) => {
  return (
    <View className="list-head">
      <Text className="list-title">{title}</Text>

      {showAction && (
        <TouchableOpacity
          className="list-action"
          onPress={onPressViewAll}
          activeOpacity={0.7}
        >
          <Text className="list-action-text">View All</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

export default ListHeading