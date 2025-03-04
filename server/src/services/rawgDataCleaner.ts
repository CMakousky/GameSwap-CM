import fs from 'node:fs/promises';

// Cleaned RAWG query output types
interface GameSwapType {
    title: string;
    publisher: string;
    released: string;
    description: string;
    image: string;
}

interface RawgSearchResults {
    slug: string;
    name: string;
}

// Clean the response data from RAWG searches to only include the name and slug for each game.
const dataCleaner = async (data: any): Promise<RawgSearchResults[]> => {
    let cleanData: RawgSearchResults[] = data.results.map(
        (result: any) => {
        return { slug: result.slug, name: result.name }
        }
    );
    if (data.next) {
        let nextPage = data.next;
        // Grab results from the first 10 pages of the search results.
        for (let page = 0; page < 10; page++) {
        let response1 = await fetch(nextPage);
        let data1 = await response1.json();
        let cleanData1: RawgSearchResults[] = data1.results.map(
            (result: any) => {
            return { slug: result.slug, name: result.name }
            }
        );
        cleanData = cleanData.concat(cleanData1);
        // Break out of the loop if there is no next page.
        if (!data1.next) {break};
        nextPage = data1.next;
        };
    };
    return cleanData;
};

// Clean the response data from a RAWG slug search to only include data compliant with the GameSwapType interface.
const slugDataCleaner = (data: any): GameSwapType => {
    const cleanData: GameSwapType = {
        title: data.name,
        publisher: data.publishers[0].name,
        released: data.released,
        image: data.background_image,
        description: data.description
    };
    return cleanData;
};

// Write the results of gamesByName query to the searchHistory.json file.
const writeSearchHistory = async (cleanData: RawgSearchResults[]) => {
    return await fs.writeFile('src/seeds/searchHistory.json', JSON.stringify(cleanData, null, '\t'));
};

export { dataCleaner, slugDataCleaner, writeSearchHistory, GameSwapType, RawgSearchResults };