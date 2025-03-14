const plainText = (htmlString: string) => {
    return htmlString.replace(/<[^>]+>/g, '');
};

export { plainText };