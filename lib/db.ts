import mongoose, { Connection } from "mongoose";
import httpCodesMasterData from "@/public/assets/httpCodesMaster.json";
import { importHttpCodes } from "./http-codes";
let cachedConnection: Connection | null = null;

export async function connectToMongoDB() {
  if (cachedConnection) {
    console.log("Using cached db connection");
    return cachedConnection;
  }
  try {
    const cnx = await mongoose.connect(process.env.MONGODB_URI!);
    cachedConnection = cnx.connection;
    console.log("New mongodb connection established");
    addDefaultRecords();
    return cachedConnection;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function addDefaultRecords() {
  return Promise.all([addHttpCodesMaster()]);
}

async function addHttpCodesMaster() {
  try {
    const response = await importHttpCodes(httpCodesMasterData);
    console.log(`Add Http codes master data: ${response}`);
  } catch (error) {
    console.error(`Failed to add http codes master data due to: ${error}`);
  }
}