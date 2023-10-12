export default function sanitizeString(inputString) {
    // Залишаємо тільки букви та цифри
    // const sanitizedString = inputString.replace(/[^a-zA-Z0-9\s]/g, "");
    const sanitizedString = inputString.replace(/[^\p{L}\p{N}\s]/gu, "");
    return sanitizedString;
}
