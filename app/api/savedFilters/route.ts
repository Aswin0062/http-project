import { SavedFilterProcessingResult, TResultResponse, TSavedFilterRequest } from "@/dao";
import { getAll, saveFilter } from "@/lib/savedFilters";
import { getToken, JWT } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const { name, query, codes } = await req.json() as TSavedFilterRequest;
    const token: JWT | null = await getToken({req});
    try {
        let message: string = '';
        const result = await saveFilter(name, query, codes, token!["id"] as string);
        switch (result) {
            case SavedFilterProcessingResult.DUPLICATE_NAME:
                message = 'Filters with Name already exists';
                break;
            case SavedFilterProcessingResult.INVALID_CODES:
                message = 'Invalid Codes are present';
                break;
            case SavedFilterProcessingResult.MISSING_MANDATORY:
                message = 'Name and Query is mandatory';
                break;
            case SavedFilterProcessingResult.SUCCESS:
                message = 'Filter Saved Successfully';
                break;
            default:
                message = 'Please try again later';
        }
        return Response.json({ message, result: result === SavedFilterProcessingResult.SUCCESS } as TResultResponse, { status: result === SavedFilterProcessingResult.SUCCESS ? 201 : 400 });
    } catch (e) {
        console.error(`Failed to save filter due to ${e}`);
        return Response.json({ message: "Please try again later", result: false } as TResultResponse, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const token: JWT | null = await getToken({req});
    try {
        let result = await getAll(token!["id"] as string);
            return Response.json(result, {status: 200});
    } catch (error) {
        console.error(`Failed to get saved filters due to ${error}`);
        return Response.json({ message: "Please try again later" }, { status: 500 });
    }
}