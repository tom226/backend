import api from '../api/client';

const RAZORPAY_KEY_ID = 'rzp_live_SLVdO8A3IQT9TJ'; // Replace with your key

export async function createRazorpayOrder(amountInPaise, receipt) {
  const data = await api.request('/api/payment/create-order', {
    method: 'POST',
    body: JSON.stringify({ amount: amountInPaise, receipt }),
  });
  return data;
}

export async function verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }) {
  const data = await api.request('/api/payment/verify', {
    method: 'POST',
    body: JSON.stringify({ razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }),
  });
  return data;
}

export { RAZORPAY_KEY_ID };