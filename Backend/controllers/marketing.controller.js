import { 
    smsMarketingTemplate,
    whatsappMarketingTemplate,
    emailMarketingTemplate,
    orderUpdateTemplate,
    emailOtpTemplate 
} from "../config/messages.js";

const getMessageTemplates = (req, res) => {
    const name = "{{name}}";
    const discount = "{{discount}}";
    const promoCode = "{{promo code}}";
    const orderId = "{{orderId}}";
    const status = "{{status}}";
    const trackingLink = "{{trackingLink}}";
    const otp = "{{otp}}";

    const templates = {
        smsMarketingTemplate : smsMarketingTemplate(name, discount, promoCode),
        whatsappMarketingTemplate : whatsappMarketingTemplate(name, discount, promoCode),
        emailMarketingTemplate : emailMarketingTemplate(name, discount, promoCode),
        orderUpdateTemplate : orderUpdateTemplate(name, orderId, status, trackingLink),
        emailOtpTemplate : emailOtpTemplate(otp)
    }

    res.json(templates);
};

export {
    getMessageTemplates,
};