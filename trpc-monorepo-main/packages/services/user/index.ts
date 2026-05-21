import { db, eq } from "@repo/database";
import {usersTable } from "@repo/database/schema";
import {
  createUserWithEmailAndPasswordInputSchema,
  CreateUserWithEmailAndPasswordInputSchemaType,
  generateUserTokenPayload,
  GenerateUserTokenPayloadType,
  getUserByEmailInput,
  GetUserByEmailInputType,
  signInUserWithEmailAndPasswordInput,
  SignInUserWIthEmailAndPasswordInputType,
} from "./model";
import {randomBytes } from "crypto";
import * as JWT from "jsonwebtoken";
import { env } from "../env";
import { generateHash } from "../utils/generateHash";

class UserService {
  //generate user token
  private async generateUserToken(payload: GenerateUserTokenPayloadType) {
    const { id } = await generateUserTokenPayload.parseAsync(payload);
    const token = JWT.sign({ id }, env.JWT_SERECT);
    return { token };
  }

  //get the user by email
  public async getUserByEmail(
    input: GetUserByEmailInputType,
  ) {
    const { email } = getUserByEmailInput.parse(input);

    const [row] = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!row) {
      return undefined;
    }

    return row;
  }

  //create user
  public async createUserWithEmailAndPassword(
    payload: CreateUserWithEmailAndPasswordInputSchemaType,
  ) {
    const { fullName, email, password } =
      await createUserWithEmailAndPasswordInputSchema.parseAsync(payload);

    //check if user is already exist
    const existingUser = await this.getUserByEmail({email});
    if (existingUser) {
      throw new Error(`User with this email ${email} already exists `);
    }
    //hash the password
    const salt = randomBytes(16).toString("hex");
    const hash = generateHash(salt,password)

    //insert user in db
    const [user] = await db
      .insert(usersTable)
      .values({
        fullName,
        email,
        password: hash,
        salt
      })
      .returning();

    if (!user) {
      throw new Error("Failed to create user");
    }
    const userID = user.id;
    const { token } = await this.generateUserToken({ id: userID });

    return {token, id: userID };
  }


  //signin user
  public async signinUserWithEmailAndPassword(
    payload: SignInUserWIthEmailAndPasswordInputType
  ){
    const {email, password} = await signInUserWithEmailAndPasswordInput.parseAsync(payload)
    //check the user with this email present in db or not
    const existingUser = await this.getUserByEmail({email})
    if(!existingUser){
      throw new Error(`User with ${email} does not exist`)
    }
    if(!existingUser.password|| !existingUser.salt) throw new Error("Invalid auth method")
    
    const checkPassword = generateHash(existingUser.salt,password)
    if(checkPassword !== existingUser.password){
      throw new Error("Invalid email or password")
    }
    
    const {token} = await this.generateUserToken({id: existingUser.id})
    return {
      id: existingUser.id,
      token
    }
  }
}

export default UserService;
