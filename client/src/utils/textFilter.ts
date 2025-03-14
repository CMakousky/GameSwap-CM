// Function that uses a regular expression to strip HTML elements out of a string
const plainText = (htmlString: string) => {
    return htmlString.replace(/<[^>]+>/g, '');
};

export { plainText };