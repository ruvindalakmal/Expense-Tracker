import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Header from "@/components/Header";
import ImageUpload from "@/components/ImageUpload";
import ModalWrapper from "@/components/ModalWrapper";
import Typo from "@/components/Typo";
import { expenseCategories, transactionTypes } from "@/constants/data";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import useFetchData from "@/hooks/useFetchData";
import { deleteWallet } from "@/services/walletService";
import { TransactionType, WalletType } from "@/types";
import { scale, verticalScale } from "@/utils/styling";
import { useLocalSearchParams, useRouter } from "expo-router";
import { orderBy, where } from "firebase/firestore";
import * as Icons from "phosphor-react-native";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Input from "@/components/Input";


const TransactionModal = () => {

    const { user } = useAuth();

    const [transaction, setTransaction] = useState<TransactionType>({
        type: "expense",
        amount: 0,
        description: "",
        category: "",
        date: new Date(),
        walletId: "",
        image: null
    });

    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const router = useRouter();

    const { data: wallets,
        error: walletError,
        loading: walletLoading
    } = useFetchData<WalletType>("wallets", [
        where("uid", "==", user?.uid),
        orderBy("created", "desc")
    ]);

    const oldTransaction: { name: string; image: string, id: string } = useLocalSearchParams();

    const onDateChange = (event: any, selectedDate: any) => {
        const currentDate = selectedDate || transaction.date;
        setTransaction({ ...transaction, date: currentDate });
        setShowDatePicker(Platform.OS == 'ios' ? true : false);
    };

    // useEffect(() => {
    //     if(oldTransaction?.id){
    //         setTransaction({
    //             name: oldTransaction.name,
    //             image: oldTransaction.image,
    //         });
    //     }
    // }, []);

    const onsubmit = async () => {
        const {type, amount , description , category , date , walletId , image} = transaction;

        if(!walletId || !date || !amount || (type == 'expense' && !category)){
            Alert.alert("Transaction" , "Please fill all the fields");
            return ;
        }
        console.log("Good to Go!");

        let transactionData : TransactionType = {
            type,
            amount,
            description,
            category,
            date,
            walletId,
            image,
            uid : user?.uid
        };
        
        console.log("Trasaction Data : " , transactionData);
    }

    const onDelete = async () => {
        if (!oldTransaction?.id) return;
        setLoading(true);
        const response = await deleteWallet(oldTransaction?.id);
        setLoading(false);
        if (response.success) {
            router.back();
        } else {
            Alert.alert("Wallet", response.msg || "Something went wrong");
        }

    }

    const showDeleteAlert = () => {
        Alert.alert("Delete Wallet", "Are you sure you want to delete this wallet? \n This action will remove all the transaction related to this wallet.", [
            {
                text: "Cancel",
                onPress: () => console.log("Delete cancelled"),
                style: "cancel",

            },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => onDelete(),
            },
        ]);
    }

    return (
        <ModalWrapper>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? "padding" : "height"}
                style={{ flex: 1 }}>
                <View style={styles.container}>
                    <Header title={oldTransaction?.id ? "Update Transaction" : "New Transaction"} leftIcon={<BackButton />} style={{ marginBottom: spacingY._10 }} />

                    <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                        <View style={styles.inputContainer}>
                            <Typo color={colors.neutral200} size={16}>Type</Typo>
                            {/* Dropdown Here */}
                            <Dropdown
                                style={styles.dropdownContainer}
                                activeColor={colors.neutral700}
                                // placeholderStyle={styles.dropdownPlaceholder}
                                selectedTextStyle={styles.dropdownSelectedText}
                                iconStyle={styles.dropdownIcon}
                                data={transactionTypes}
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                itemTextStyle={styles.dropdownItemText}
                                itemContainerStyle={styles.dropdownItemContainer}
                                containerStyle={styles.dropdownListContainer}
                                // placeholder={!isFocus ? 'Select item' : '...'}
                                value={transaction.type}
                                onChange={(item) => {
                                    setTransaction({ ...transaction, type: item.value });
                                }}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Typo color={colors.neutral200} size={16}>Wallet</Typo>
                            {/* Dropdown Here */}
                            <Dropdown
                                style={styles.dropdownContainer}
                                activeColor={colors.neutral700}
                                placeholderStyle={styles.dropdownPlaceholder}
                                selectedTextStyle={styles.dropdownSelectedText}
                                iconStyle={styles.dropdownIcon}
                                data={wallets.map((wallet) => ({
                                    label: `${wallet?.name} ($${wallet.amount})`,
                                    value: wallet?.id,
                                }))}
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                itemTextStyle={styles.dropdownItemText}
                                itemContainerStyle={styles.dropdownItemContainer}
                                containerStyle={styles.dropdownListContainer}
                                placeholder={'Select Wallet'}
                                value={transaction.walletId}
                                onChange={(item) => {
                                    setTransaction({ ...transaction, walletId: item.value || "" });
                                }}
                            />
                        </View>

                        {
                            transaction.type === 'expense' && (
                                <View style={styles.inputContainer}>
                                    <Typo color={colors.neutral200} size={16}>Expense Category</Typo>
                                    {/* Dropdown Here */}
                                    <Dropdown
                                        style={styles.dropdownContainer}
                                        activeColor={colors.neutral700}
                                        placeholderStyle={styles.dropdownPlaceholder}
                                        selectedTextStyle={styles.dropdownSelectedText}
                                        iconStyle={styles.dropdownIcon}
                                        data={Object.values(expenseCategories)}
                                        maxHeight={300}
                                        labelField="label"
                                        valueField="value"
                                        itemTextStyle={styles.dropdownItemText}
                                        itemContainerStyle={styles.dropdownItemContainer}
                                        containerStyle={styles.dropdownListContainer}
                                        placeholder={'Select Category'}
                                        value={transaction.category}
                                        onChange={(item) => {
                                            setTransaction({ ...transaction, category: item.value || "" });
                                        }}
                                    />
                                </View>
                            )
                        }

                        <View style={styles.inputContainer}>
                            <Typo color={colors.neutral200} size={16}>Date</Typo>
                            {
                                !showDatePicker && (
                                    <Pressable style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
                                        <Typo size={14}>{(transaction.date as Date).toLocaleDateString()}</Typo>
                                    </Pressable>
                                )
                            }
                            {
                                showDatePicker && (
                                    <View style={Platform.OS == 'ios' && styles.iosDatePicker}>
                                        <DateTimePicker
                                            themeVariant="dark"
                                            value={transaction.date as Date}
                                            textColor={colors.white}
                                            mode="date"
                                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                            onChange={onDateChange}
                                        />
                                        {
                                            Platform.OS == 'ios' && (
                                                <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(false)}>
                                                    <Typo size={15} fontWeight={"500"}>Ok</Typo>
                                                </TouchableOpacity>
                                            )
                                        }
                                    </View>
                                )
                            }

                        </View>

                        <View style={styles.inputContainer}>
                            <Typo color={colors.neutral200} size={16}>Amount</Typo>
                            <Input
                                keyboardType='numeric'
                                // placeholder="Name"
                                value={transaction.amount?.toString()}
                                onChangeText={(value: any) => setTransaction({ ...transaction, amount: Number(value.replace(/[^0-9]/g, "")) })}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={styles.flexRow}>
                                <Typo color={colors.neutral200} size={16}>Description</Typo>
                                <Typo color={colors.neutral500} size={14}>(optional)</Typo>
                            </View>
                            <Input
                                // placeholder="Name"
                                value={transaction.description}
                                multiline
                                containerStyle={{
                                    flexDirection : 'row',
                                    height : verticalScale(100),
                                    alignItems : 'flex-start',
                                    paddingVertical : 15
                                }}
                                onChangeText={(value: any) => setTransaction({ ...transaction, description: value })}
                            />
                        </View>



                        <View style={styles.inputContainer}>
                            <View style={styles.flexRow}>
                                <Typo color={colors.neutral200} size={16}>Description</Typo>
                                <Typo color={colors.neutral500} size={14}>(optional)</Typo>
                            </View>
                            <ImageUpload
                                file={transaction.image}
                                onClear={() => setTransaction({ ...transaction, image: null })}
                                onSelect={(file) => setTransaction({ ...transaction, image: file })}
                                placeholder="Upload Image" />
                        </View>
                    </ScrollView>
                    <View style={styles.footer}>
                        {oldTransaction?.id && !loading && (
                            <Button onPress={showDeleteAlert} style={{ backgroundColor: colors.rose, paddingHorizontal: spacingX._15 }} >
                                <Icons.TrashIcon size={verticalScale(20)} color={colors.white} weight="fill" />
                            </Button>
                        )}
                        <Button onPress={onsubmit} loading={loading} style={{ flex: 1 }}>
                            <Typo color={colors.black} fontWeight={"700"}>{oldTransaction?.id ? "Update Transaction" : "Add Transaction"}</Typo>
                        </Button>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </ModalWrapper>
    );
}

export default TransactionModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacingY._20
    },
    form: {
        gap: spacingY._20,
        paddingVertical: spacingY._15,
        paddingBottom: spacingY._40
    },
    footer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        paddingHorizontal: spacingX._20,
        gap: scale(12),
        paddingTop: spacingY._15,
        borderTopColor: colors.neutral700,
        marginBottom: spacingY._5,
        borderTopWidth: 1
    },
    inputContainer: {
        gap: spacingY._10
    },
    iosDropDown: {
        flexDirection: "row",
        height: verticalScale(54),
        alignItems: "center",
        justifyContent: "center",
        fontSize: verticalScale(14),
        borderWidth: 1,
        color: colors.white,
        borderColor: colors.neutral300,
        borderRadius: radius._17,
        borderCurve: "continuous",
        paddingHorizontal: spacingX._15
    },
    androidDropDown: {
        // flexDirection : "row",
        height: verticalScale(54),
        alignItems: "center",
        justifyContent: "center",
        fontSize: verticalScale(14),
        borderWidth: 1,
        color: colors.white,
        borderColor: colors.neutral300,
        borderRadius: radius._17,
        borderCurve: "continuous",
        // paddingHorizontal : spacingX._15
    },
    flexRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacingX._5
    },
    dateInput: {
        flexDirection: "row",
        height: verticalScale(54),
        alignItems: "center",
        borderWidth: 1,
        color: colors.white,
        borderColor: colors.neutral300,
        borderRadius: radius._17,
        borderCurve: "continuous",
        paddingHorizontal: spacingX._15
    },
    iosDatePicker: {
        // backgroundColor : "red"
    },
    datePickerButton: {
        backgroundColor: colors.neutral700,
        alignSelf: "flex-end",
        padding: spacingY._7,
        marginRight: spacingX._7,
        paddingHorizontal: spacingY._15,
        borderRadius: radius._10
    },
    dropdownContainer: {
        height: verticalScale(54),
        marginTop: verticalScale(12),
        borderWidth: 1,
        borderColor: colors.neutral300,
        paddingHorizontal: spacingX._15,
        borderRadius: radius._15,
        borderCurve: "continuous"
    },
    dropdownItemText: {
        color: colors.white
    },
    dropdownSelectedText: {
        color: colors.white,
        fontSize: verticalScale(14)
    },
    dropdownListContainer: {
        backgroundColor: colors.neutral900,
        borderRadius: radius._15,
        borderCurve: "continuous",
        paddingVertical: spacingY._7,
        top: 5,
        borderColor: colors.neutral500,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 1,
        shadowRadius: 15,
        elevation: 5
    },
    dropdownPlaceholder: {
        color: colors.white,
    },
    dropdownItemContainer: {
        borderRadius: radius._15,
        marginHorizontal: spacingX._7
    },
    dropdownIcon: {
        height: verticalScale(30),
        tintColor: colors.neutral300
    }
});