
// Approved Message Templates will go here!

export const smsMarketingTemplate = (name, discount, promoCode) => {
    return `Hi ${name}, get ${discount}% OFF on your next order! Use code: ${promoCode}. Shop now: bit.ly/shop-now - NoorShop`;
};

export const whatsappMarketingTemplate = (name, discount, promoCode) => {
    return `*Hi ${name} 👋*\nEnjoy *${discount}% OFF* on your next order!\nUse code 👉 *${promoCode}*\n🛍️ Shop now: bit.ly/shop-now - NoorShop`;
};

export const emailMarketingTemplate = (name, discount, promoCode) => {
    return `
      <div style="font-family:Arial,sans-serif; line-height:1.6;">
        <h2 style="color:#333;">Hi ${name},</h2>
        <p>We're giving you <strong>${discount}% OFF</strong> your next purchase at <strong>Noor</strong>!</p>
        <p>Use promo code: <strong style="background:#f2f2f2; padding:4px 8px;">${promoCode}</strong> at checkout.</p>
        <a href="bit.ly/shop-now" style="display:inline-block; padding:10px 20px; background:#007bff; color:#fff; text-decoration:none; border-radius:5px;">Shop Now</a>
        <p style="color:#555;">Hurry, this offer won't last long!</p>
      </div>
    `;
};

export const orderUpdateTemplate = (name, orderId, status, trackingLink) => {
    return `*Hi ${name} 👋*\nYour order *#${orderId}* is now *${status}*.\nTrack your order here: ${trackingLink}\nThank you for shopping with Noor 🛍️`;
};

export const emailOtpTemplate = (otp) => {
    return `
    <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
      <h1 style="font-size: 20px; margin-bottom: 10px;">Thank you for signing up with our E Commerce Storefront</h1>
      <p style="margin: 4px 0;">Here is your confirmation One Time Password. Kindly do not share this with anyone.
        Enter this on the otp verification page to verify your email address.
      </p>
      <p style="margin: 4px 0;"><strong>Note:</strong> Without verifying your Email you cannot register with us.</p>
      <p style="margin: 4px 0;">Your OTP is <h2 style="font-size: 18px;">${otp}</h2>It is valid for only 5 minutes.</p>
      <p style="margin: 4px 0;">This is an autogenerated Email for otp verification. Please do not reply to this email.</p>
    </div>
    `;
};