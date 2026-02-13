import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, Keyboard } from 'react-native';

type Props = {
    length?: number;
    onComplete?: (otp: string) => void;
};

export type OtpInputRef = {
    getOtp: () => string;
    onFocus: () => void;
};

const OtpInput = forwardRef<OtpInputRef, Props>(
  ({ length = 6, onComplete }, ref) => {
    const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
    const inputsRef = useRef<Array<TextInput | null>>([]);

    useImperativeHandle(ref, () => ({
        getOtp: () => otp.join(''),
        onFocus: () => focusInput(0),
    }));

    const focusInput = (index: number) => {
        inputsRef.current[index]?.focus();
    };

    const handleChange = (text: string, index: number) => {
        const clean = text.replace(/[^0-9]/g, '');

        // paste support
        if (clean.length > 1) {
            const pasted = clean.slice(0, length).split('');
            const newOtp = Array(length).fill('');

            for (let i = 0; i < pasted.length; i++) {
                newOtp[i] = pasted[i];
            }

            setOtp(newOtp);

            const lastIndex = Math.min(pasted.length, length - 1);
            focusInput(lastIndex);

            if (pasted.length === length) {
                Keyboard.dismiss();
                onComplete?.(newOtp.join(''));
            }
            return;
        }

        // single digit replace
        const newOtp = [...otp];
        newOtp[index] = clean;
        setOtp(newOtp);

        // move next only if typed a digit
        if (clean && index < length - 1) {
            focusInput(index + 1);
        }

        // completed
        if (index === length - 1 && clean) {
            Keyboard.dismiss();
            onComplete?.(newOtp.join(''));
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key !== 'Backspace') {return;}

        const newOtp = [...otp];

        if (otp[index]) {
            // clear current
            newOtp[index] = '';
            setOtp(newOtp);
            return;
        }

        // if current empty, go previous and clear
        if (index > 0) {
            newOtp[index - 1] = '';
            setOtp(newOtp);
            focusInput(index - 1);
        }
    };

    const handleBoxPress = (index: number) => {
        focusInput(index);
    };

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                {otp.map((digit, index) => (
                    <Pressable key={index} onPress={() => handleBoxPress(index)}>
                        <TextInput
                            ref={(ref) => {
                            inputsRef.current[index] = ref;
                            }}
                            value={digit}
                            onChangeText={(text) => handleChange(text, index)}
                            onKeyPress={({ nativeEvent }) =>
                                handleKeyPress(nativeEvent.key, index)
                            }
                            keyboardType="number-pad"
                            maxLength={1}
                            style={styles.box}
                            textAlign="center"
                            selectionColor="#4ade80"
                        />
                    </Pressable>
                ))}
            </View>
        </View>
    );
},);

const styles = StyleSheet.create({
    container: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    box: {
        width: 50,
        height: 55,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#444',
        backgroundColor: '#241f41',
        color: 'white',
        fontSize: 20,
        textAlign: 'center',
    },
});

export default OtpInput;
