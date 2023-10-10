export default function extractMovieTitle(inputString) {
    // Використовуємо регулярний вираз для пошуку тексту в лапках
    const startQuoteIndex = inputString.indexOf('"');
    const endQuoteIndex = inputString.lastIndexOf('"');

    if (
        startQuoteIndex !== -1 &&
        endQuoteIndex !== -1 &&
        startQuoteIndex !== endQuoteIndex
    ) {
        // Використовуйте метод substring для вибору тексту між лапками
        return inputString.substring(startQuoteIndex + 1, endQuoteIndex);
    } else {
        return "";
    }
}
