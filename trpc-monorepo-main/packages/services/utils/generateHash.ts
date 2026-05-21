import { createHmac } from "crypto";

export function generateHash(salt:string,password:string){
  return createHmac("SHA256", salt).update(password).digest("hex");
}