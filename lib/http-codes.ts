import { HttpCodeBulkImportResult, IHttpCodeDao } from "@/dao"
import { connectToMongoDB } from "./db"
import HttpCodeModel, { IHttpCode } from "@/models/httpCodes"
import mongoose from "mongoose";


export function getHttpDogImageUrl(code: string): string {
  return `https://http.dog/${code}.jpg`
}

export async function getAll(codeFilter?: string | null): Promise<IHttpCodeDao[]> {
  let codes:IHttpCode[] = [];
  try {
    if (codeFilter?.trim().length) {
      codes = await HttpCodeModel.find<IHttpCode>().where({code : {$regex: codeFilter}}).sort({code: 'asc'});
    } else {
      codes = await HttpCodeModel.find<IHttpCode>().sort({code: 'asc'});
    }
    return codes.map(code => ({id: code.id,code: code.code, name: code.name, description: code.description,image: !code.image ? getHttpDogImageUrl(code.code) : code.image}));
  } catch (error) {
    console.error(`Failed to get all http codes due to: ${error}`);
  }
  return [];
}

export async function importHttpCodes(codes: IHttpCodeDao[]): Promise<HttpCodeBulkImportResult> {
  if (!codes?.length) {
    return HttpCodeBulkImportResult.EMPTY_LIST;
  }
  if (!isValidData(codes)) {
    return HttpCodeBulkImportResult.INVALID_REQUEST;
  }
  if (isDuplicatesPresent(codes)) {
    return HttpCodeBulkImportResult.DUPLICATE_CODE;
  }
  const uniqueCodes = getUniqueCodes(codes);
  await connectToMongoDB();
  const existingHttpCodes = await HttpCodeModel.find<IHttpCode>({ "code": { $in: uniqueCodes } });
  if (existingHttpCodes.length) {
    return HttpCodeBulkImportResult.EXISTING_CODE;
  }
  await HttpCodeModel.bulkSave(codes.map(({ code, name, description, image }) => new HttpCodeModel({ name, description, code, image })));
  return HttpCodeBulkImportResult.SUCCESS;
}

export async function isAllCodesPresent(codeIds: string[]): Promise<boolean> {
  if (!codeIds?.length) {
    return false;
  }
  await connectToMongoDB();
  const existingCodeCount = await HttpCodeModel.countDocuments().where({"_id": {$in: codeIds.map(id => new mongoose.Types.ObjectId(id))}});
  return existingCodeCount === codeIds.length;
}

function getUniqueCodes(codes: IHttpCodeDao[]) {
  return Array.from(new Set(codes.map(({ code }) => code)));
}

function isDuplicatesPresent(codes: IHttpCodeDao[]) {
  const uniqueCodes = getUniqueCodes(codes);
  return uniqueCodes.length !== codes.length;
}

function isValidData(codes: IHttpCodeDao[]) {
  return codes.findIndex(({ code, name, description }) => !code || isNaN(Number(code)) || name?.trim().length === 0 || description?.trim().length === 0) === -1;
}