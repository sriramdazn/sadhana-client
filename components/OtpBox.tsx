import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, StyleSheet, View, Pressable } from 'react-native';
import { Button } from 'antd';

import OtpInput, { OtpInputRef } from './OtpInput';

import { getSession, saveSession } from '@/utils/storage';
import { getUserId, setDecayPoints, verifyEmailOtp } from '@/services/auth.service';
import { emitAuthChanged } from '@/utils/authEvents';
import { theme } from '@/constants/theme';
import { TStage } from '@/app/(tabs)/settings';
import { sadanaSyncPayload } from '@/utils/sadhanaPayload';
import { useGuestStorage } from '@/hooks/useGuestStorage';

const OTP_LENGTH = 4;

type TProps = {
    email: string;
    otpId: string | null;
    dailyDecay: number;
    onSetDailyDecay: (value: number) => void;
    onSetStage: (value: TStage) => void;
    onControllerReady: (controller: AbortController) => void;
};

const OtpBox = ({ email, otpId, dailyDecay, onSetDailyDecay, onSetStage, onControllerReady }: TProps) => {
    const [loading, setLoading] = useState(false);
    const otpRef = useRef<OtpInputRef>(null);
    const controllerRef = useRef<AbortController>(new AbortController());

    useEffect(() => {
        const controller = new AbortController();
        controllerRef.current = controller;
        onControllerReady(controller);
        otpRef.current?.onFocus();

        return () => {
            controller.abort();
        };
    }, []);

    const handleOtpVerify = useCallback(async (otp: string) => {
        if (!otpId) { alert('Missing otpId'); return; }
        if (otp.length < OTP_LENGTH) { alert('Enter valid OTP'); return; }

        const { signal } = controllerRef.current;

        setLoading(true);
        try {
            const preSession = await getSession();
            if (signal.aborted) return;

            const storedDecay = preSession.decayPoints;
            const journey = (await useGuestStorage.getJourney()) ?? [];
            if (signal.aborted) return;

            const payload = await sadanaSyncPayload({ days: journey });
            if (signal.aborted) return;

            const res = await verifyEmailOtp({ otpId, otp: Number(otp), ...payload }, signal);
            if (signal.aborted) return;

            const user = await getUserId(res.token);
            if (signal.aborted) return;

            await saveSession({
                token: res.token,
                email,
                userId: user.id,
                isLoggedIn: true,
            });
            if (signal.aborted) return;

            let nextDecay =
                typeof storedDecay === 'number'
                    ? storedDecay
                    : typeof user.decayPoints === 'number'
                        ? user.decayPoints
                        : dailyDecay;

            try {
                await setDecayPoints({ decayPoints: nextDecay }, res.token);
            } catch (pushErr) {
                console.log('Failed pushing local decay', pushErr);
                if (typeof user.decayPoints === 'number') nextDecay = user.decayPoints;
            }
            if (signal.aborted) return;

            await saveSession({
                token: res.token,
                email,
                userId: user.id,
                isLoggedIn: true,
                decayPoints: nextDecay,
            });
            if (signal.aborted) return;

            onSetDailyDecay(nextDecay);
            emitAuthChanged();
            onSetStage("done");

        } catch (err: any) {
            if (err?.name === 'AbortError' || signal.aborted) return;
            alert(err?.message || 'OTP verification failed');
        } finally {
            if (!signal.aborted) setLoading(false);
        }
    }, [email, otpId, dailyDecay, onSetDailyDecay, onSetStage]);

    return (
        <View style={styles.inputBlock}>
            <Pressable onPress={() => onSetStage("email")}>
                <Text style={styles.back}>← Back</Text>
            </Pressable>

            <Text style={styles.label}>Enter OTP sent to {email}</Text>

            <OtpInput ref={otpRef} length={OTP_LENGTH} onComplete={(otp) => handleOtpVerify(otp)} />

            <Button
                type="primary"
                size="large"
                style={styles.mainButton}
                onClick={() => handleOtpVerify(otpRef.current?.getOtp() ?? '')}
                loading={loading}
                disabled={otpRef.current?.getOtp().length !== OTP_LENGTH}
            >
                Verify
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    inputBlock: { gap: 10 },
    back: { color: theme.colors.text, fontWeight: '500', fontSize: 15, marginBottom: 10 },
    label: { color: theme.colors.text, fontWeight: '600', fontSize: 16 },
    mainButton: {
        borderRadius: 30,
        height: 48,
        fontSize: 18,
        backgroundColor: 'rgba(155, 93, 229, 0.95)',
        color: "#fff",
    },
    container: { paddingVertical: 20, paddingHorizontal: 20, flex: 1 },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
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

export default OtpBox;