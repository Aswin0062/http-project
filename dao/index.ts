export type TResultResponse = {
    message: string,
    result: boolean
}

export type ISignUpRequest = {
    email?: string, password?: string
}

export type ISignUpResponse = TResultResponse;

export type IHttpCodeDao = {
    code: string;
    name: string;
    description: string;
    image?: string;
    id?: string;
}

export enum UserRoles {
    USER = 'USER'
}

export enum HttpCodeBulkImportResult {
    INVALID_REQUEST,
    DUPLICATE_CODE,
    EXISTING_CODE,
    EMPTY_LIST,
    SUCCESS
}

export type TSavedFilterRequest = {
    name: string,
    query: string,
    codes: string[]
}

export enum SavedFilterProcessingResult {
    INVALID_CODES,
    DUPLICATE_NAME,
    MISSING_MANDATORY,
    INVALID_ID,
    SUCCESS
}

export type TSavedFilter = {
    name: string,
    query: string,
    httpCodes?: {id:string, code: string, image: string}[],
    id: string,
    createdAt: Date,
    updatedAt: Date,
}

export type TSavedFilterUpdate = {
    result: boolean;
    filter?: TSavedFilter;
    errorMessage?: string;
}