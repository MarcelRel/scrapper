export const transformString = (str: string): string => {
    const cleanedString = str.replace(/[.\s:]/g, '');

    return cleanedString;
}

export const formatDateToNumberString = (date: Date): string => {
    const padZero = (num: number) => num.toString().padStart(2, '0');

    const formattedDate = `${date.getFullYear()}${padZero(date.getMonth() + 1)}${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;

    return transformString(formattedDate);
}