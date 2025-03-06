import { getAll } from "@/lib/http-codes";
import { NextRequest } from "next/server";

export async function  GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const codeSearchParam = searchParams?.get('code');
    try {
        let filter: string | null = null;
        if (codeSearchParam?.trim().length && /[\dxX]*/.test(codeSearchParam.trim())) {
            filter = codeSearchParam.padEnd(3, 'x').trim().replace(/x/ig,'\\d');
        }
        const results = await getAll(filter);
        return Response.json(results, {status: 200});
    } catch (error) {
        console.error(`Failed to get all http codes due to ${error}`);
        return Response.json({ message: "Please try again later"}, {status: 500});
    }
}