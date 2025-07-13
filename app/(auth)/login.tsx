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


const Login = () => {

    const emailRef = useRef("");
    const passwordRef = useRef("");

    const router = useRouter();
    
    const {login : loginUser} = useAuth();

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if(!emailRef.current || !passwordRef.current) {
            Alert.alert("Login Error", "Please fill all the fields");
            return;
        }
        setIsLoading(true);
        const response = await loginUser(emailRef.current, passwordRef.current);
        setIsLoading(false);
        if(!response.success) {
            Alert.alert("Login Error", response.msg);
        }

    }

    return (
        <ScreenWrapper>
            <View style = {styles.container}>
                <BackButton iconSize={28}/>

                <View style = {{gap : 5, marginTop: spacingY._20}}>
                    <Typo size={30}>Hey ,</Typo>
                    <Typo size={30}>Welcome Back</Typo>
                </View>

                <View style = {styles.form} >
                    <Typo size={16}  color = {colors.textLighter}>
                        Login now to track all your expenses
                    </Typo>
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

                    <Typo size={14} color={colors.text} style={{alignSelf : 'flex-end'}}>Forget Password</Typo>

                    <Button onPress = {handleSubmit} loading={isLoading}>
                        <Typo fontWeight={'600'} size={22} color={colors.neutral900}>
                            Login
                        </Typo>
                    </Button>
                </View>

                <View style= {styles.footer}>
                    <Typo size={15}>Don't have an account?</Typo>
                    <Pressable onPress={() => router.navigate('/(auth)/register')}>
                        <Typo size={15} fontWeight={700} color={colors.primary}>Sign Up</Typo>
                    </Pressable>
                </View>

            </View>
        </ScreenWrapper>
    );
}

export default Login;

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