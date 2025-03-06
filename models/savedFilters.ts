import mongoose, { Schema, Document, PopulatedDoc, Types } from "mongoose";
import { IHttpCode } from "./httpCodes";


export interface ISavedFilters extends Document {
  name: string;
  userId: mongoose.Types.ObjectId;
  codes: Array<PopulatedDoc<Document<mongoose.Types.ObjectId> & IHttpCode>>;
  searchQuery: string;
  createdAt: Date;
  updatedAt: Date;
}


const SavedFiltersSchema: Schema = new Schema<ISavedFilters>({
  name: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  codes: [{type: mongoose.Schema.Types.ObjectId, ref: "HttpCode", requied: true}],
  searchQuery: { type: String, required: true },
}, {timestamps: true});


const SavedFilters = mongoose.models.SavedFilters || mongoose.model<ISavedFilters>("SavedFilters", SavedFiltersSchema);

export default SavedFilters;
