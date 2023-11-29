export default function sanitizeString(inputString) {
  const sanitizedString = inputString.replace(/[^\p{L}\p{N}\s]/gu, '');
  return sanitizedString;
}
