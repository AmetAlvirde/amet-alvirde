export const getCollection = () => Promise.resolve([]);
export const getEntry = () => Promise.resolve(undefined);
export const getEntries = () => Promise.resolve([]);
export const render = () => Promise.resolve({ Content: () => null });
export const defineCollection = (c: unknown) => c;
export const reference = (coll: string) => () => coll;
