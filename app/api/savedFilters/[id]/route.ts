import { SavedFilterProcessingResult, TSavedFilterRequest, TSavedFilterUpdate } from "@/dao";
import { deleteFilter, getSavedFilterById, updateFilter } from "@/lib/savedFilters";
import { getToken, JWT } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const token: JWT | null = await getToken({ req });
    try {
        if (id) {
            let result = await getSavedFilterById(id, token!["id"] as string);
            if (result) {
                return Response.json(result, { status: 200 });
            } else {
                return Response.json({ message: 'Not Found' }, { status: 404 });
            }
        } else {
            return Response.json({ message: 'Id Param Not found' }, { status: 400 });
        }
    } catch (error) {
        console.error(`Failed to get saved filters due to ${error}`);
        return Response.json({ message: "Please try again later" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const token: JWT | null = await getToken({ req });
    try {
        if (id) {
            let result = await deleteFilter(id, token!["id"] as string);
            if (result) {
                return Response.json({ message: "Deleted Successfully", result: true }, { status: 200 });
            } else {
                return Response.json({ message: 'Not Found', result: false }, { status: 404 });
            }
        } else {
            return Response.json({ message: "id param is mandatory", result: false }, { status: 400 });
        }
    } catch (error) {
        console.error(`Failed to delete saved filters due to ${error}`);
        return Response.json({ message: "Please try again later" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { name, codes } = await req.json() as TSavedFilterRequest;
    const token: JWT | null = await getToken({ req });
    try {
        if (id) {
            let result = await updateFilter(id, name, codes, token!["id"] as string);
            let message = '';
            let updatedFilter = null;
            switch (result) {
                case SavedFilterProcessingResult.DUPLICATE_NAME:
                    message = 'Filters with Name already exists';
                    break;
                case SavedFilterProcessingResult.INVALID_CODES:
                    message = 'Invalid Codes are present';
                    break;
                case SavedFilterProcessingResult.INVALID_ID:
                    message = 'Invalid Filter Id';
                    break;
                case SavedFilterProcessingResult.SUCCESS:
                    message = 'Filter Updated Successfully';
                    updatedFilter = await getSavedFilterById(id, token!["id"] as string);
                    break;
                default:
                    message = '';
            }
            return Response.json({ errorMessage: message, result: SavedFilterProcessingResult.SUCCESS === result, filter: updatedFilter } as TSavedFilterUpdate, { status: SavedFilterProcessingResult.SUCCESS === result ? 200 : 400 });
        } else {
            return Response.json({ errorMessage: "id param is mandatory", result: false }, { status: 400 });
        }
    } catch (error) {
        console.error(`Failed to update saved filters due to ${error}`);
        return Response.json({ errorMessage: "Please try again later", result: false }, { status: 500 });
    }
}