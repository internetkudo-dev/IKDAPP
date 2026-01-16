// // components/TopUpCard.tsx
// import { Ionicons } from "@expo/vector-icons";
// import { Text, TouchableOpacity, View } from "react-native";

// type Props = {
//   id: number;
//   gb: number;
//   days: number;
//   price: string;
//   selected: boolean;
//   onSelect: (id: number) => void;
// };

// export default function TopUpCard({
//   id,
//   gb,
//   days,
//   price,
//   selected,
//   onSelect,
// }: Props) {
//   return (
//     <TouchableOpacity
//       className={`flex-row items-center justify-between bg-[#ebf3ff] rounded-2xl px-4 py-8 mb-3 ${
//         selected ? "border-2 border-[#004FFE]" : "border border-transparent"
//       }`}
//       onPress={() => onSelect(id)}
//       activeOpacity={0.8}
//     >
//       <View className="flex-row items-center">
//         <Ionicons
//           name={selected ? "radio-button-on" : "radio-button-off"}
//           size={22}
//           color={selected ? "#004FFE" : "#888"}
//           style={{ marginRight: 10 }}
//         />
//         <Text className="text-2xl font-semibold text-black mr-1">
//           {gb} GB •
//         </Text>
//         <Text className="text-base font-semibold text-black">{days} Days</Text>
//       </View>
//       <Text className="text-base font-semibold text-black">{price}</Text>
//     </TouchableOpacity>
//   );
// }
