const fixtureBase = new URL('../test/fixtures/', import.meta.url);

export const readFixture = async function (path: string): Promise<string> {

    const url = new URL(path, fixtureBase);
    if (url.protocol === 'file:') {
        const Fs = await import('fs/promises');
        return await Fs.readFile(url, 'utf-8');
    }

    return (await fetch(url)).text();
};
