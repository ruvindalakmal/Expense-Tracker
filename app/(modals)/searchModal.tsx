import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import Input from "@/components/Input";
import ModalWrapper from "@/components/ModalWrapper";
import TransactionList from "@/components/TransactionList";
import { colors, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import useFetchData from "@/hooks/useFetchData";
import { TransactionType } from "@/types";
import { useRouter } from "expo-router";
import { orderBy, where } from "firebase/firestore";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";


const WalletModal = () => {

    const {user , updateUserData} = useAuth();

    const [loading, setLoading] = useState(false);
    const router = useRouter(); 
    const [search , setSearch] = useState("");

    const constraints = [
        where("uid" , "==" ,user?.uid),
        orderBy("date" , "desc"),
    ];

    const { data: allTransactions,
        error,
        loading: transactionLoading
    } = useFetchData<TransactionType>("transactions",constraints);

    const filterdTransactions = allTransactions?.filter((item) => {
        if(search.length>1){
            if(
                item.type.toLowerCase().includes(search.toLowerCase()) ||
                item.category?.toLowerCase().includes(search.toLowerCase()) ||
                item.description?.toString().toLowerCase().includes(search.toLowerCase())
            ){
                return true;
            }
            return false;
        }
        return true;
    });

    return (
        <ModalWrapper style={{backgroundColor : colors.neutral900}}>
            <View style={styles.container}>
                <Header title={"Search"} leftIcon = {<BackButton/>} style={{marginBottom : spacingY._10}}/>

                <ScrollView contentContainerStyle = {styles.form}>
                    <View style = {styles.inputContainer}>
                        <Input
                            placeholder="Shoes..."
                            value={search}
                            placeholderTextColor={colors.neutral400}
                            containerStyle={{backgroundColor: colors.neutral800}}
                            onChangeText={(value) => setSearch( value )}
                        />
                    </View>
                    <View>
                        <TransactionList
                            loading={transactionLoading}
                            data={filterdTransactions}
                            emptyListMessage="No Transactions match your search keywords"
                        />
                    </View>
                </ScrollView>
            </View>
        </ModalWrapper>
    );
}

export default WalletModal;

const styles = StyleSheet.create({
    container : {
        flex : 1,
        justifyContent : 'space-between',
        paddingHorizontal : spacingY._20,
        //paddingVertical : spacingY._30,
    },
    form : {
        gap : spacingY._30,
        marginTop : spacingY._15,
    },
    avatatContainer : {
        position : 'relative',
        alignSelf : 'center',
    },
    inputContainer : {
        gap : spacingY._10,
    }
});