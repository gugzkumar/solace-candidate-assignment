/**
 * Function to format 10 digit integers into a string that is a human friendly phone numbers
 * 
 * Example: 5551234567 -> (555) 123-4567
 * 
 * @param phoneNumberString 
 * @returns 
 */
export function formatPhoneNumber(phoneNumberString: number) {
  var cleaned = ("" + phoneNumberString).replace(/\D/g, "");
  var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return "(" + match[1] + ") " + match[2] + "-" + match[3];
  }
  return "";
}