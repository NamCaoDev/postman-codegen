import { BASE_POSTMAN_DOCUMENT_API_URL } from "./constants";

export type FetchPostmanDocumentParams = {
    collectionId: string;
    collectionAccessKey: string;
}

export const fetchPostmanApiDocument = async (params: FetchPostmanDocumentParams) => {
    try {
        const {collectionId, collectionAccessKey} = params;
        const res = await fetch(`${BASE_POSTMAN_DOCUMENT_API_URL}/${collectionId}?access_key=${collectionAccessKey}`);
        const jsonData = await res.json();
        return jsonData;
    } catch(err) {
        console.error(
            `❌ Error when fetch postman document ${err.message}`
        );
    }
}