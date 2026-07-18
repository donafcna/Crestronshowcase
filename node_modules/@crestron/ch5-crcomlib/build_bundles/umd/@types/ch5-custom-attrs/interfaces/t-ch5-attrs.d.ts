export type Ch5AttrShowTypes = 'visibility' | 'display' | 'remove';
export type SavedElementInfo = {
    uniqueElementId: string;
    attributeName: string;
    attributeValue: string;
};
export type SubAtrribute = {
    typeOfAttribute: string;
    attributeSelector: string;
    valueToTranslate: string;
    hasAttribute: boolean;
};
