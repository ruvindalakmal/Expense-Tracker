import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Header from "@/components/Header";
import ImageUpload from "@/components/ImageUpload";
import Input from "@/components/Input";
import ModalWrapper from "@/components/ModalWrapper";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { createOrUpdateWallet, deleteWallet } from "@/services/walletService";
import { WalletType } from "@/types";
import { scale, verticalScale } from "@/utils/styling";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";


const WalletModal = () => {

    const {user , updateUserData} = useAuth();

    const [wallet, setWallet] = useState<WalletType>({
        name: "",
        image: null,
    });

    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const oldWallet : {name : string; image: string , id : string} = useLocalSearchParams();

    useEffect(() => {
        if(oldWallet?.id){
            setWallet({
                name: oldWallet.name,
                image: oldWallet.image,
            });
        }
    }, []);

    const onsubmit =async () => {
        let { name, image } = wallet;
        if(!name.trim() || !image){
            Alert.alert("Wallet" , "Please fill all the fields");
            return;
        }

        const data : WalletType = {
            name,
            image,
            uid : user?.uid,
        };

        if(oldWallet?.id){data.id = oldWallet?.id;}
        setLoading(true);
        const response = await createOrUpdateWallet(data);
        setLoading(false);
        console.log("Response from createOrUpdateWallet: ", response);
        if(response.success){
            router.back();
        }else{
            Alert.alert("Wallet", response.msg || "Something went wrong");
        }

    };

    const onDelete = async () => {
        if(!oldWallet?.id) return;
        setLoading(true);
        const response = await deleteWallet(oldWallet?.id);
        setLoading(false);
        if(response.success){
            router.back();
        }else{
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
            <View style={styles.container}>
                <Header title={ oldWallet?.id ? "Update Wallet" : "New Wallet"} leftIcon = {<BackButton/>} style={{marginBottom : spacingY._10}}/>

                <ScrollView contentContainerStyle = {styles.form}>
                    <View style = {styles.inputContainer}>
                        <Typo color={colors.neutral200}>Wallet Name</Typo>
                        <Input
                            placeholder="Name"
                            value={wallet.name}
                            onChangeText={(value) => setWallet({...wallet, name: value })}
                        />
                    </View>
                    <View style = {styles.inputContainer}>
                        <Typo color={colors.neutral200}>Wallet Icon</Typo>
                        <ImageUpload 
                        file={wallet.image} 
                        onClear={() => setWallet({...wallet , image : null})} 
                        onSelect={(file) => setWallet({...wallet , image : file})}
                        placeholder="Upload Image"/>
                    </View>
                </ScrollView>
                <View style={styles.footer}>
                    {oldWallet?.id && !loading && (
                        <Button onPress={showDeleteAlert} style={{backgroundColor : colors.rose, paddingHorizontal : spacingX._15}} >
                            <Icons.TrashIcon size={verticalScale(20)} color={colors.white} weight="fill"/>
                        </Button>
                    )}
                    <Button onPress={onsubmit} loading= {loading} style={{flex: 1}}>
                        <Typo color={colors.black} fontWeight={"700"}>{oldWallet?.id ? "Update Wallet" : "Add Wallet"}</Typo>
                    </Button>
                </View>
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
    footer : {
        alignItems : 'center',
        justifyContent : 'center',
        flexDirection : 'row',
        paddingHorizontal : spacingX._20,
        gap : scale(12),
        paddingTop : spacingY._15,
        borderTopColor : colors.neutral700,
        marginBottom : spacingY._5,
        borderTopWidth : 1
    },
    form : {
        gap : spacingY._30,
        marginTop : spacingY._15,
    },
    avatatContainer : {
        position : 'relative',
        alignSelf : 'center',
    },
    avatar : {
        alignSelf : 'center',
        backgroundColor : colors.neutral300,
        height : verticalScale(135),
        width : verticalScale(135),
        borderRadius : 200,
        borderWidth : 1,
        borderColor : colors.neutral500,
        //overflow : 'hidden',
        //position : 'relative',
    },
    editIcon : {
        position : 'absolute',
        bottom : spacingY._5,
        right : spacingX._5,
        borderRadius : 100,
        backgroundColor : colors.neutral100,
        shadowColor : colors.black,
        shadowOffset : {width: 0, height: 0},
        shadowOpacity : 0.25,
        shadowRadius : 10,
        elevation : 4,
        padding : spacingY._7,
    },
    inputContainer : {
        gap : spacingY._10,
    }
});