// Function that uses a regular expression to strip HTML elements out of a string
const plainText = (htmlString: string) => {
    const noHTML = htmlString.replace(/<[^>]+>/g, '');
    const filteredText = noHTML.replace(/&#39;/g, '\'');
    return filteredText;
};

export { plainText };