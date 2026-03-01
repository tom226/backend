import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';
import { createRazorpayOrder, verifyPayment, RAZORPAY_KEY_ID } from '../utils/payment';
import { haptic } from '../utils/platform';

const { width } = Dimensions.get('window');

export default function PaymentScreen({ navigation, route }) {
  const { amount, orderId, orderDetails } = route.params;
  const [loading, setLoading] = useState(true);
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null); // null | 'success' | 'failed'
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initPayment();
  }, []);

  const initPayment = async () => {
    try {
      const order = await createRazorpayOrder(amount * 100, `order_${orderId}`);
      setRazorpayOrder(order);
      setLoading(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to initialize payment. Please try again.');
      navigation.goBack();
    }
  };

  const showResult = (status) => {
    setPaymentStatus(status);
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  const handlePaymentResponse = async (data) => {
    try {
      if (data.razorpay_payment_id) {
        const result = await verifyPayment({
          razorpay_order_id: data.razorpay_order_id,
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_signature: data.razorpay_signature,
          orderId,
        });
        if (result.verified) {
          haptic.success();
          showResult('success');
        } else {
          haptic.error();
          showResult('failed');
        }
      } else {
        haptic.error();
        showResult('failed');
      }
    } catch (err) {
      haptic.error();
      showResult('failed');
    }
  };

  const razorpayHTML = razorpayOrder ? `
    <!DOCTYPE html>
    <html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script></head>
    <body style="margin:0;background:#f5f5f5;display:flex;align-items:center;justify-content:center;min-height:100vh;">
    <script>
      var options = {
        key: '${RAZORPAY_KEY_ID}',
        amount: ${razorpayOrder.amount},
        currency: '${razorpayOrder.currency}',
        name: 'The Nursery Green',
        description: 'Order Payment',
        order_id: '${razorpayOrder.id}',
        prefill: { name: '${orderDetails?.name || ''}', email: '${orderDetails?.email || ''}', contact: '${orderDetails?.phone || ''}' },
        theme: { color: '#22863A' },
        handler: function(response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'success', ...response }));
        },
        modal: {
          ondismiss: function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'dismissed' }));
          }
        }
      };
      var rzp = new Razorpay(options);
      rzp.on('payment.failed', function(response) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'failed', error: response.error }));
      });
      rzp.open();
    </script></body></html>
  ` : '';

  const onWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'success') handlePaymentResponse(data);
      else if (data.type === 'failed') showResult('failed');
      else if (data.type === 'dismissed') navigation.goBack();
    } catch (e) {}
  };

  if (paymentStatus) {
    const isSuccess = paymentStatus === 'success';
    return (
      <View style={[styles.container, styles.center]}>
        <Animated.View style={[styles.resultCard, { transform: [{ scale: scaleAnim }] }]}>
          <Ionicons name={isSuccess ? 'checkmark-circle' : 'close-circle'} size={80} color={isSuccess ? '#22863A' : '#e53e3e'} />
          <Text style={styles.resultTitle}>{isSuccess ? 'Payment Successful!' : 'Payment Failed'}</Text>
          <Text style={styles.resultDesc}>{isSuccess ? `₹${amount} paid successfully` : 'Something went wrong. Please try again.'}</Text>
          <TouchableOpacity style={[styles.resultBtn, { backgroundColor: isSuccess ? '#22863A' : '#e53e3e' }]}
            onPress={() => isSuccess ? navigation.navigate('Orders') : navigation.goBack()}>
            <Text style={styles.resultBtnText}>{isSuccess ? 'View Orders' : 'Try Again'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Initializing payment...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pay ₹{amount}</Text>
        <View style={{ width: 30 }} />
      </View>
      <WebView
        source={{ html: razorpayHTML }}
        onMessage={onWebViewMessage}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingTop: 50, paddingBottom: Spacing.sm, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.text },
  loadingText: { marginTop: 16, ...Fonts.regular, color: Colors.textLight },
  resultCard: { alignItems: 'center', padding: 40, marginHorizontal: 24, backgroundColor: Colors.surface, borderRadius: Radius.xl, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  resultTitle: { fontSize: 22, ...Fonts.bold, color: Colors.text, marginTop: 16 },
  resultDesc: { fontSize: 14, ...Fonts.regular, color: Colors.textLight, marginTop: 8, textAlign: 'center' },
  resultBtn: { marginTop: 24, paddingHorizontal: 32, paddingVertical: 14, borderRadius: Radius.lg },
  resultBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});