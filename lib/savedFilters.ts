import { IHttpCodeDao, SavedFilterProcessingResult, TSavedFilter, TSavedFilterRequest } from "@/dao"
import { getHttpDogImageUrl, isAllCodesPresent } from "./http-codes"
import SavedFilters, { ISavedFilters } from "@/models/savedFilters"
import mongoose from "mongoose"

export interface ResponseCodeList {
  id: string
  name: string
  userId: string
  createdAt: Date
  codes: number[]
}

let lists: ResponseCodeList[] = []

export async function saveFilter(name: string, query: string, codes: string[], createdUser: string): Promise<SavedFilterProcessingResult> {
  if (!name || name.trim().length === 0 || !query || query.trim().length === 0) {
    return SavedFilterProcessingResult.MISSING_MANDATORY;
  }
  const isCodesValid = !codes.length || (await isAllCodesPresent(codes));
  if (!isCodesValid) {
    return SavedFilterProcessingResult.INVALID_CODES;
  } else {
    const existingFiltersWithName = await SavedFilters.countDocuments().where({ name });
    if (existingFiltersWithName) {
      return SavedFilterProcessingResult.DUPLICATE_NAME;
    }
  }
  const savedFilter = new SavedFilters({ name, searchQuery: query, userId: new mongoose.Types.ObjectId(createdUser), codes: codes.map(code => new mongoose.Types.ObjectId(code)) });
  await savedFilter.save();
  return SavedFilterProcessingResult.SUCCESS;
}

export async function getAll(userId: string): Promise<TSavedFilter[]> {
  const results = await SavedFilters.find<ISavedFilters>()
    .populate("codes", "id code image")
    .where({ "userId": new mongoose.Types.ObjectId(userId) })
    .sort({ updatedAt: 'desc' });
  const savedFilters = results.map(({ id, name, searchQuery, codes, createdAt, updatedAt }) => ({ 
    id, 
    name, 
    query: searchQuery, 
    httpCodes: codes.reduce((final, current) => {
      if (current && !(current instanceof mongoose.Types.ObjectId)) {
        final!.push({id: current.id, code: current.code, image: current.image ?? getHttpDogImageUrl(current.code)});
      }
      return final;
    }, [] as TSavedFilter['httpCodes']),
    createdAt, 
    updatedAt 
  }));
  return savedFilters;
}

export async function getSavedFilterById(id: string, userId: string): Promise<TSavedFilter | null> {
  const filterFromDb = await SavedFilters.findOne<ISavedFilters>().populate("codes").where({ "userId": new mongoose.Types.ObjectId(userId), "_id": new mongoose.Types.ObjectId(id) });
  if (filterFromDb) {
    return {
      name: filterFromDb.name, 
      query: filterFromDb.searchQuery, 
      id: filterFromDb.id, 
      createdAt: filterFromDb.createdAt, 
      updatedAt: filterFromDb.updatedAt,
      httpCodes: filterFromDb.codes.reduce((final, current) => {
        if (current && !(current instanceof mongoose.Types.ObjectId)) {
          final!.push({id: current.id, code: current.code, image: current.image ?? getHttpDogImageUrl(current.code)});
        }
        return final;
      }, [] as TSavedFilter['httpCodes']),
    }
  }
  return null;
}

export async function updateFilter(
  id: string,
  name: string,
  codes: string[],
  userId: string
): Promise<SavedFilterProcessingResult> {
  const existingFilter = await getSavedFilterById(id, userId);
  if (!existingFilter) {
    return SavedFilterProcessingResult.INVALID_ID;
  }
  else {
    if (existingFilter.name !== name) {
      const existingFiltersWithName = await SavedFilters.countDocuments().where({ name });
    if (existingFiltersWithName) {
      return SavedFilterProcessingResult.DUPLICATE_NAME;
    }
    }
    const isCodesValid = !codes.length || (await isAllCodesPresent(codes));
  if (!isCodesValid) {
    return SavedFilterProcessingResult.INVALID_CODES;
  }
  const updatedResponse = await SavedFilters.updateOne({_id:  new mongoose.Types.ObjectId(id), userId: new mongoose.Types.ObjectId(userId)}, {name, codes: codes.map(code => new mongoose.Types.ObjectId(code))});
  console.debug(`Filter updated response for id: ${id} and userId:${userId} - ${updatedResponse}`);
  return SavedFilterProcessingResult.SUCCESS;
  }
}

export async function deleteFilter(id: string, userId: string): Promise<boolean> {
  const savedFilter = await getSavedFilterById(id, userId);
  if (savedFilter) {
    const {deletedCount} = await SavedFilters.deleteOne().where({"_id": new mongoose.Types.ObjectId(id), "userId": new mongoose.Types.ObjectId(userId)});
    return deletedCount === 1;
  }
  return false;
}

