export default function extractMovieTitle(inputString) {
    // Використовуємо регулярний вираз для пошуку тексту в лапках
    // Знаходимо всі початкові та кінцеві індекси лапок в рядку

    const lastStartQuoteIndex = inputString.lastIndexOf('"');
    const lastEndQuoteIndex = inputString.lastIndexOf(
        '"',
        lastStartQuoteIndex - 1
    );

    if (
        lastStartQuoteIndex !== -1 &&
        lastEndQuoteIndex !== -1 &&
        lastStartQuoteIndex > lastEndQuoteIndex
    ) {
        // Використовуйте метод substring для вибору тексту між останніми лапками
        return inputString.substring(
            lastEndQuoteIndex + 1,
            lastStartQuoteIndex
        );
    } else {
        return "";
    }
}
