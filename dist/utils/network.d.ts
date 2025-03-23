export type FetchPostmanDocumentParams = {
    collectionId: string;
    collectionAccessKey: string;
};
export declare const fetchPostmanApiDocument: (params: FetchPostmanDocumentParams) => Promise<any>;
