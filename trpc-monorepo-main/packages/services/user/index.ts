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

  //generate access token
  private async generateAccessToken(payload: GenerateUserTokenPayloadType) {
    const { id } = await generateUserTokenPayload.parseAsync(payload);
    const accessToken = JWT.sign({ id }, env.JWT_SERECT, {
      expiresIn: "1h",
    });
    return { accessToken };
  }
  //generate refresh token
  private async generateRefreshToken(payload: GenerateUserTokenPayloadType) {
    const { id } = await generateUserTokenPayload.parseAsync(payload);
    const refreshToken = JWT.sign({ id }, env.JWT_SERECT, {
      expiresIn: "7d",
    });
    return { refreshToken };
  }
  //verify token
  private async verifyToken(token:string){
    try {
      const decode = JWT.verify(token, env.JWT_SERECT) as GenerateUserTokenPayloadType
      return decode
    } catch (error) {
      throw new Error("Invalid token")
    }
  }

  private async getUserInfoById(id:string){
    const user = await db.select(
      {
        id:usersTable.id,
        email:usersTable.email,
        fullName:usersTable.fullName,
        profileImageUrl:usersTable.profileImageUrl
      }
    ).from(usersTable).where(eq(usersTable.id,id))

    if(!user || user.length == 0) throw new Error("user with id not exist")
    
    return user[0]!
    
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
    const { accessToken} = await this.generateAccessToken({ id: userID });
    const { refreshToken} = await this.generateRefreshToken({ id: userID });

    await db
      .update(usersTable)
      .set({ refreshToken })
      .where(eq(usersTable.id, userID));

    return {accessToken, refreshToken, id: userID };
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
    const { accessToken} = await this.generateAccessToken({ id: existingUser.id });
    const { refreshToken} = await this.generateRefreshToken({ id: existingUser.id });

    await db
      .update(usersTable)
      .set({ refreshToken })
      .where(eq(usersTable.id, existingUser.id));

    return {
      id: existingUser.id,
      accessToken,
      refreshToken
    }
  }

  //check for the user refreshtoken and regenrate the token
  public async checkUserRefreshToken(token:string){
    if(!token) throw new Error("Invalid token")
    await this.verifyToken(token)
    
    const storedRefreshToken = await db.select({
      id: usersTable.id,
      refreshToken: usersTable.refreshToken
    }).from(usersTable).where(eq(usersTable.refreshToken, token))

    if(!storedRefreshToken || storedRefreshToken.length === 0) throw new Error("Invalid refreshToken")
    const userID = storedRefreshToken[0]?.id
    if(userID === undefined) throw new Error("user id is undefined while verify the refreshToken")
    const { accessToken} = await this.generateAccessToken({ id:userID });
    const { refreshToken} = await this.generateRefreshToken({ id:userID});

    await db
      .update(usersTable)
      .set({ refreshToken })
      .where(eq(usersTable.id, userID));

    return{
      accessToken,
      refreshToken
    }
  }


  //verify the user token and decode 
  public async verifyAndDecodeUserToken(token:string){
    const {id} = await this.verifyToken(token)
    const userInfo = await this.getUserInfoById(id)
    return{
      ...userInfo
    }
      
    
  }
  
}

export default UserService;
