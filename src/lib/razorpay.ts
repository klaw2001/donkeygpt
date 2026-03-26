import Razorpay from "razorpay";

function createRazorpayClient() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

const globalForRazorpay = globalThis as unknown as {
  razorpay: Razorpay | undefined;
};

export const razorpay = globalForRazorpay.razorpay ?? createRazorpayClient();

if (process.env.NODE_ENV !== "production") globalForRazorpay.razorpay = razorpay;
