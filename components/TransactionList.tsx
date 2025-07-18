import { expenseCategories, incomeCategory } from "@/constants/data";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { TransactionItemProps, TransactionListType } from "@/types";
import { verticalScale } from "@/utils/styling";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Loading from "./Loading";
import Typo from "./Typo";
import { Timestamp } from "firebase/firestore";

const TransactionList = ({
        data,
    title,
    loading,
    emptyListMessage,
} : TransactionListType) => {
    const handleClick = () => {
        // todo : Open transaction details 
    }
    return (
        <View style={styles.container}>
            {
                title && (
                    <Typo size={20} fontWeight={"500"}>{title}</Typo>
                )
            }
            <View style = {styles.list}>
                <FlashList
                    data={data}
                    renderItem={({ item , index }) => <TransactionItem item = {item} index = {index} handleClick={handleClick}/>}
                    estimatedItemSize={60}
                />
            </View>
            { !loading && data.length == 0 && (
                <Typo size={15} color= {colors.neutral400} style={{textAlign : "center" , marginTop : spacingY._15}}>{emptyListMessage}</Typo>
            )}
            {
                loading && (
                    <View style = {{ top :verticalScale(100) }}
                    ><Loading/></View>
                )
            }
        </View>
    );
}

const TransactionItem = ({
    item,
    index, 
    handleClick
}: TransactionItemProps) => {
    let category = item?.type == 'income' ? incomeCategory : expenseCategories[item.category!];
    const IconComponent = category.icon;

    const date = (item?.date as Timestamp)?.toDate()?.toLocaleDateString("en-GB" ,{
        day : "numeric",
        month : "short"
    });

    return (
        <Animated.View entering={FadeInDown.delay(index * 100).springify().damping(14)}>
            <TouchableOpacity style = {styles.row} onPress={() => handleClick(item)}>
                <View style = {[styles.icon , {backgroundColor : category.bgColor}]}>
                    {
                        IconComponent && (
                            <IconComponent
                                size={verticalScale(25)}
                                weight="fill"
                                color={colors.white}
                            />
                        )
                    }
                </View>
                <View style = {styles.categoryDes}>
                    <Typo size={17}>{category.label}</Typo>
                    <Typo size={12} color={colors.neutral400} textProps={{numberOfLines : 1}}>{item?.description}</Typo>
                </View>
                <View style = {styles.amountDate}>
                    <Typo color={item?.type == 'income' ? colors.primary : colors.rose} fontWeight={"500"}>{`${item?.type == "income" ? "+ " : "- "}${item?.amount}`}</Typo>
                    <Typo size={13} color={colors.neutral400}>{date}</Typo>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default TransactionList;

const styles = StyleSheet.create({
    container : {
        gap : spacingY._17,
        // flex : 1
        // backgroundColor : "red"
    },
    list : {
        minHeight : 3
    },
    row : {
        flexDirection : "row",
        alignItems : "center",
        justifyContent : "space-between",
        gap : spacingX._12,
        marginBottom : spacingY._12,

        backgroundColor : colors.neutral800,
        padding : spacingY._10,
        paddingHorizontal : spacingY._10,
        borderRadius : radius._17
    },
    icon : {
        height : verticalScale(44),
        aspectRatio : 1,
        justifyContent : "center",
        alignItems : "center",
        borderRadius : radius._12,
        borderCurve : "continuous",
    },
    categoryDes : {
        flex : 1,
        gap : 2.5
    },
    amountDate : {
        alignItems : "flex-end",
        gap : 3
    } 
});