import mongoose, { Schema, Document } from "mongoose";


export interface IHttpCode extends Document {
  code: string;
  name: string;
  description: string;
  image?: string;
}


const HttpCodeSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: {type: String}
});

const HttpCodeModel = mongoose.models.HttpCode || mongoose.model<IHttpCode>("HttpCode", HttpCodeSchema);

export default HttpCodeModel;
