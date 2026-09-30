export function toWhatsappNumber(phone: string) {
  let digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 10) digits = `225${digits.slice(1)}`;
  if (digits.length === 10) digits = `225${digits}`;
  return digits;
}

export function telHref(phone: string) {
  const digits = toWhatsappNumber(phone);
  return `tel:+${digits}`;
}

export function whatsappHref(phone: string, text: string) {
  const digits = toWhatsappNumber(phone);
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
