import { Alert, Pressable, StyleSheet , Text , View } from "react-native";
import React, { useRef, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import BackButton from "@/components/BackButton";
import Input from "@/components/Input";
import * as Icons from 'phosphor-react-native'
import  Button  from "@/components/Button";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/authContext";

const Register = () => {

    const emailRef = useRef("");
    const passwordRef = useRef("");
    const nameRef = useRef("");

    const router = useRouter();

    const {register : registerUser} = useAuth();

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if(!emailRef.current || !passwordRef.current || !nameRef.current) {
            Alert.alert("Sign Up", "Please fill all the fields");
            return;
        }
        setIsLoading(true);;
        const response = await registerUser(emailRef.current, passwordRef.current, nameRef.current);

        setIsLoading(false);
        console.log("Register Result:", response);
        if(!response.success) {
            Alert.alert("Sign Up Error", response.msg || "Something went wrong. Please try again.");
        }
    }

    return (
        <ScreenWrapper>
            <View style = {styles.container}>
                <BackButton iconSize={28}/>

                <View style = {{gap : 5, marginTop: spacingY._20}}>
                    <Typo size={30}>Let's ,</Typo>
                    <Typo size={30}>Get Started!</Typo>
                </View>

                <View style = {styles.form} >
                    <Typo size={15}  color = {colors.textLighter}>
                        Create an account to track all your expenses
                    </Typo>
                    <Input
                    placeholder="Enter your name"
                    onChangeText={(value) => (nameRef.current = value)}
                    icon={<Icons.UserIcon size={verticalScale(26)} color={colors.neutral300}/>}
                    />
                    <Input
                    placeholder="Enter your email"
                    onChangeText={(value) => (emailRef.current = value)}
                    icon={<Icons.AtIcon size={verticalScale(26)} color={colors.neutral300}/>}
                    />
                    <Input
                    placeholder="Enter your Password"
                    secureTextEntry
                    onChangeText={(value) => (passwordRef.current = value)}
                    icon={<Icons.LockIcon size={verticalScale(26)} color={colors.neutral300}/>}
                    />

                    <Button onPress = {handleSubmit} loading={isLoading}>
                        <Typo fontWeight={'600'} size={22} color={colors.neutral900}>
                            Sign Up
                        </Typo>
                    </Button>
                </View>

                <View style= {styles.footer}>
                    <Typo size={15}>Already have an account?</Typo>
                    <Pressable onPress={() => router.navigate('/(auth)/login')}>
                        <Typo size={15} fontWeight={700} color={colors.primary}>Login</Typo>
                    </Pressable>
                </View>

            </View>
        </ScreenWrapper>
    );
}



export default Register;

const styles = StyleSheet.create({
    container : {
        flex : 1,
        gap: spacingY._30,
        paddingHorizontal:spacingX._20,
    },
    welcomeText: {
        fontSize: verticalScale(20),
        fontWeight: 'bold',
        color: colors.text,
    },
    form : {
        gap: spacingY._20,
    },
    forgotPassword : {
        textAlign: 'right',
        fontWeight: '500',
        color : colors.text
    },
    footer : {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap : 5
    },
    footerText : {
        textAlign: 'center',
        color : colors.text,
        fontSize : verticalScale(15),
    }
});