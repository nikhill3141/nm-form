import { and, db, eq, gt, type InferInsertModel } from "@repo/database";
import {
  formFieldsTable,
  formLinksTable,
  formResponsesTable,
  formsTable,
  responseAnswersTable,
  usersTable,
} from "@repo/database/schema";
import {
  createUserWithEmailAndPasswordInputSchema,
  CreateUserWithEmailAndPasswordInputSchemaType,
  generateUserTokenPayload,
  GenerateUserTokenPayloadType,
  getUserByEmailInput,
  GetUserByEmailInputType,
  requestPasswordResetInput,
  RequestPasswordResetInputType,
  resetPasswordInput,
  ResetPasswordInputType,
  signInUserWithEmailAndPasswordInput,
  SignInUserWIthEmailAndPasswordInputType,
  verifyEmailInput,
  VerifyEmailInputType,
} from "./model";
import * as JWT from "jsonwebtoken";
import { env } from "../env";
import { createUniqueFormSlug } from "../utils/slug";
import {
  createSecureToken,
  hashPassword,
  hashToken,
  isLegacyPasswordHash,
  verifyPassword,
} from "../utils/password";

type DemoFieldSeed = Omit<
  InferInsertModel<typeof formFieldsTable>,
  "formId"
>;

type DemoFormSeed = Omit<
  InferInsertModel<typeof formsTable>,
  "slug" | "userId" | "responseCount"
> & {
  responses: string[][];
  fields: DemoFieldSeed[];
};


class UserService {
  private readonly guestEmail = "judges.demo@nmforms.local";

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
        profileImageUrl:usersTable.profileImageUrl,
        emailVerified: usersTable.emailVerified,
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
    const hashedPassword = await hashPassword(password);
    const verificationToken = createSecureToken();
    const verificationTokenHash = hashToken(verificationToken);
    const verificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    //insert user in db
    const [user] = await db
      .insert(usersTable)
      .values({
        fullName,
        email,
        password: hashedPassword,
        salt: null,
        emailVerified: false,
        emailVerificationTokenHash: verificationTokenHash,
        emailVerificationExpiresAt: verificationExpiresAt,
      })
      .returning();

    if (!user) {
      throw new Error("Failed to create user");
    }
    return {
      id: user.id,
      verificationToken,
      emailVerificationRequired: true,
    };
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
    if(!existingUser.password) throw new Error("Invalid auth method")
    
    const isPasswordValid = await verifyPassword({
      password,
      storedHash: existingUser.password,
      legacySalt: existingUser.salt,
    });

    if(!isPasswordValid){
      throw new Error("Invalid email or password")
    }

    if (!existingUser.emailVerified) {
      throw new Error("Please verify your email before signing in.");
    }

    const passwordUpdate = isLegacyPasswordHash(existingUser.password)
      ? { password: await hashPassword(password), salt: null }
      : {};

    const { accessToken} = await this.generateAccessToken({ id: existingUser.id });
    const { refreshToken} = await this.generateRefreshToken({ id: existingUser.id });

    await db
      .update(usersTable)
      .set({ refreshToken, ...passwordUpdate })
      .where(eq(usersTable.id, existingUser.id));

    return {
      id: existingUser.id,
      accessToken,
      refreshToken
    }
  }

  public async verifyEmail(payload: VerifyEmailInputType) {
    const { token } = await verifyEmailInput.parseAsync(payload);
    const tokenHash = hashToken(token);

    const [user] = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.emailVerificationTokenHash, tokenHash),
          gt(usersTable.emailVerificationExpiresAt, new Date())
        )
      )
      .limit(1);

    if (!user) {
      throw new Error("Email verification link is invalid or expired.");
    }

    const { accessToken } = await this.generateAccessToken({ id: user.id });
    const { refreshToken } = await this.generateRefreshToken({ id: user.id });

    await db
      .update(usersTable)
      .set({
        emailVerified: true,
        emailVerificationTokenHash: null,
        emailVerificationExpiresAt: null,
        refreshToken,
      })
      .where(eq(usersTable.id, user.id));

    return {
      id: user.id,
      accessToken,
      refreshToken,
    };
  }

  public async requestPasswordReset(payload: RequestPasswordResetInputType) {
    const { email } = await requestPasswordResetInput.parseAsync(payload);
    const user = await this.getUserByEmail({ email });

    if (!user) {
      return { success: true, resetToken: undefined };
    }

    const resetToken = createSecureToken();
    const resetTokenHash = hashToken(resetToken);

    await db
      .update(usersTable)
      .set({
        passwordResetTokenHash: resetTokenHash,
        passwordResetExpiresAt: new Date(Date.now() + 1000 * 60 * 30),
      })
      .where(eq(usersTable.id, user.id));

    return { success: true, resetToken };
  }

  public async resetPassword(payload: ResetPasswordInputType) {
    const { token, password } = await resetPasswordInput.parseAsync(payload);
    const tokenHash = hashToken(token);

    const [user] = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.passwordResetTokenHash, tokenHash),
          gt(usersTable.passwordResetExpiresAt, new Date())
        )
      )
      .limit(1);

    if (!user) {
      throw new Error("Password reset link is invalid or expired.");
    }

    const hashedPassword = await hashPassword(password);

    await db
      .update(usersTable)
      .set({
        password: hashedPassword,
        salt: null,
        refreshToken: null,
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
        emailVerified: true,
      })
      .where(eq(usersTable.id, user.id));

    return { success: true };
  }

  private async ensureGuestDemoData(userId: string) {
    const existingForms = await db
      .select({ title: formsTable.title })
      .from(formsTable)
      .where(eq(formsTable.userId, userId));
    const existingTitles = new Set(existingForms.map((form) => form.title));
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 45);
    const demoForms: DemoFormSeed[] = [
      {
        title: "Judges demo feedback",
        description:
          "A seeded presentation form with sample questions, responses, and sharing controls.",
        theme: "forest_cinematic",
        visibility: "unlisted",
        status: "published",
        isPublished: true,
        allowAnonymous: true,
        expiresAt,
        fields: [
          {
            label: "Which part of NM Forms is strongest for presentation?",
            type: "single_select",
            required: true,
            order: 0,
            placeholder: "Choose one",
            options: ["Builder flow", "Dashboard analytics", "Share controls", "Visual themes"],
          },
          {
            label: "Rate the overall project experience",
            type: "rating",
            required: true,
            order: 1,
            placeholder: "Select a rating",
          },
          {
            label: "What should we improve before final demo?",
            type: "long_text",
            required: false,
            order: 2,
            placeholder: "Share a suggestion",
          },
        ],
        responses: [
          ["Builder flow", "5", "Add a short docs link in the dashboard."],
          ["Share controls", "4", "Show QR code during the pitch."],
          ["Dashboard analytics", "5", "Keep the mobile menu simple."],
          ["Visual themes", "4", "Add one profile page for judges."],
          ["Builder flow", "5", "The publish and unpublish story is clear."],
        ],
      },
      {
        title: "Launch feedback pulse",
        description: "Public launch feedback with satisfaction, feature interest, and follow-up intent.",
        theme: "ocean_flow",
        visibility: "public",
        status: "published",
        isPublished: true,
        allowAnonymous: true,
        expiresAt,
        fields: [
          {
            label: "How did the launch page feel?",
            type: "single_select",
            required: true,
            order: 0,
            options: ["Clear", "Exciting", "Confusing", "Too long"],
          },
          { label: "Overall launch rating", type: "rating", required: true, order: 1 },
          { label: "What would make you sign up?", type: "long_text", required: false, order: 2 },
        ],
        responses: [
          ["Exciting", "5", "Show the analytics screenshot earlier."],
          ["Clear", "4", "A short demo video would help."],
          ["Exciting", "5", "The themes are memorable."],
          ["Clear", "4", "Pricing should stay simple."],
          ["Too long", "3", "Make the hero copy tighter."],
          ["Exciting", "5", "The QR sharing feels demo-ready."],
        ],
      },
      {
        title: "Product research sprint",
        description: "Public research survey for learning user workflows and tool preferences.",
        theme: "cosmic_dark",
        visibility: "public",
        status: "published",
        isPublished: true,
        allowAnonymous: true,
        expiresAt,
        fields: [
          {
            label: "What tool do you use today?",
            type: "single_select",
            required: true,
            order: 0,
            options: ["Google Forms", "Typeform", "Tally", "Custom app"],
          },
          { label: "How often do you create forms?", type: "single_select", required: true, order: 1, options: ["Daily", "Weekly", "Monthly", "Rarely"] },
          { label: "Biggest missing feature", type: "long_text", required: false, order: 2 },
        ],
        responses: [
          ["Typeform", "Weekly", "Better response analytics."],
          ["Google Forms", "Monthly", "A more polished public page."],
          ["Tally", "Weekly", "Password protected links."],
          ["Custom app", "Daily", "Typed APIs and validation."],
          ["Typeform", "Daily", "Unlisted links for clients."],
        ],
      },
      {
        title: "Event RSVP experience",
        description: "Public RSVP form with attendance, dietary preference, and planning notes.",
        theme: "minimal_luxury",
        visibility: "public",
        status: "published",
        isPublished: true,
        allowAnonymous: true,
        expiresAt,
        fields: [
          { label: "Will you attend?", type: "yes_no", required: true, order: 0, options: ["Yes", "No"] },
          { label: "Dietary preference", type: "single_select", required: false, order: 1, options: ["Vegetarian", "Vegan", "Gluten-free", "No preference"] },
          { label: "Anything the host should know?", type: "long_text", required: false, order: 2 },
        ],
        responses: [
          ["Yes", "Vegetarian", "Arriving with one guest."],
          ["Yes", "No preference", "Excited for the workshop."],
          ["No", "No preference", "Please send the recap."],
          ["Yes", "Vegan", "Need parking details."],
          ["Yes", "Gluten-free", "Happy to help with setup."],
        ],
      },
      {
        title: "Hiring screen intake",
        description: "Public candidate screen showing structured qualification data.",
        theme: "cyber_neon",
        visibility: "public",
        status: "published",
        isPublished: true,
        allowAnonymous: true,
        expiresAt,
        fields: [
          { label: "Role preference", type: "single_select", required: true, order: 0, options: ["Frontend", "Backend", "Full-stack", "Product"] },
          { label: "Years of experience", type: "number", required: true, order: 1 },
          { label: "Portfolio URL", type: "url", required: false, order: 2 },
        ],
        responses: [
          ["Frontend", "3", "https://example.com/ava"],
          ["Backend", "5", "https://example.com/dev"],
          ["Full-stack", "4", "https://example.com/lee"],
          ["Product", "6", "https://example.com/rio"],
          ["Frontend", "2", "https://example.com/kai"],
        ],
      },
      {
        title: "Customer onboarding brief",
        description: "Public onboarding form for goals, timeline, and project constraints.",
        theme: "sunset_studio",
        visibility: "public",
        status: "published",
        isPublished: true,
        allowAnonymous: true,
        expiresAt,
        fields: [
          { label: "Primary project goal", type: "single_select", required: true, order: 0, options: ["Brand", "Website", "Campaign", "Product"] },
          { label: "Target launch date", type: "date", required: false, order: 1 },
          { label: "Success metric", type: "long_text", required: false, order: 2 },
        ],
        responses: [
          ["Website", "2026-07-12", "Increase demo bookings."],
          ["Campaign", "2026-06-20", "Collect qualified leads."],
          ["Product", "2026-08-01", "Improve activation."],
          ["Brand", "2026-07-01", "Clarify positioning."],
        ],
      },
      {
        title: "Creator waitlist",
        description: "Public waitlist form collecting interest and contact preferences.",
        theme: "forest_cinematic",
        visibility: "public",
        status: "published",
        isPublished: true,
        allowAnonymous: true,
        expiresAt,
        fields: [
          { label: "What best describes you?", type: "single_select", required: true, order: 0, options: ["Founder", "Designer", "Marketer", "Student"] },
          { label: "Best email", type: "email", required: true, order: 1 },
          { label: "What will you build first?", type: "long_text", required: false, order: 2 },
        ],
        responses: [
          ["Founder", "founder@example.com", "Investor update forms."],
          ["Designer", "designer@example.com", "Research intake."],
          ["Marketer", "growth@example.com", "Campaign feedback."],
          ["Student", "student@example.com", "Club event RSVPs."],
          ["Founder", "team@example.com", "Beta onboarding."],
        ],
      },
      {
        title: "Conference session voting",
        description: "Public voting form with clear response distribution for analytics charts.",
        theme: "ocean_flow",
        visibility: "public",
        status: "published",
        isPublished: true,
        allowAnonymous: true,
        expiresAt,
        fields: [
          { label: "Which session should headline?", type: "single_select", required: true, order: 0, options: ["AI workflows", "Design systems", "Backend scale", "Founder stories"] },
          { label: "Preferred time", type: "time", required: false, order: 1 },
          { label: "How excited are you?", type: "rating", required: true, order: 2 },
        ],
        responses: [
          ["Backend scale", "10:30", "5"],
          ["AI workflows", "11:00", "5"],
          ["Design systems", "14:00", "4"],
          ["Backend scale", "15:30", "5"],
          ["Founder stories", "16:00", "4"],
        ],
      },
      {
        title: "Private partner onboarding",
        description: "Unlisted partner form with seeded responses and a shareable link.",
        theme: "minimal_luxury",
        visibility: "unlisted",
        status: "published",
        isPublished: true,
        allowAnonymous: true,
        expiresAt,
        fields: [
          { label: "Partnership type", type: "single_select", required: true, order: 0, options: ["Integration", "Referral", "Agency", "Investor"] },
          { label: "Priority level", type: "rating", required: true, order: 1 },
          { label: "Internal notes", type: "long_text", required: false, order: 2 },
        ],
        responses: [
          ["Integration", "5", "Wants API docs first."],
          ["Agency", "4", "Needs client workspace demo."],
          ["Referral", "3", "Good for post-demo follow-up."],
          ["Investor", "5", "Asked about response ingestion scale."],
        ],
      },
    ];

    for (const [demoFormIndex, demoForm] of demoForms.entries()) {
      if (existingTitles.has(demoForm.title)) continue;

      const slug = await createUniqueFormSlug(demoForm.title);

      await db.transaction(async (tx) => {
        const { fields: demoFields, responses: demoResponses, ...formData } = demoForm;
        const [form] = await tx
          .insert(formsTable)
          .values({
            ...formData,
            slug,
            responseCount: demoResponses.length,
            userId,
          })
          .returning();

        if (!form) throw new Error("failed to create guest demo form");

        if (form.visibility === "unlisted") {
          await tx
            .insert(formLinksTable)
            .values({
              formId: form.id,
              expiresAt: form.expiresAt,
            })
            .onConflictDoNothing();
        }

        const fields = await tx
          .insert(formFieldsTable)
          .values(
            demoFields.map((field) => ({
              ...field,
              formId: form.id,
            }))
          )
          .returning();
        const orderedFields = [...fields].sort((a, b) => a.order - b.order);

        for (const [responseIndex, responseAnswers] of demoResponses.entries()) {
          const submittedAt = new Date(
            Date.now() - 1000 * 60 * 60 * 24 * (demoFormIndex + responseIndex + 1)
          );
          const [response] = await tx
            .insert(formResponsesTable)
            .values({
              formId: form.id,
              respondentIp: "demo",
              userAgent: "NM Forms seeded guest data",
              isCompleted: true,
              submittedAt,
              createdAt: submittedAt,
            })
            .returning();

          if (!response) throw new Error("failed to create guest demo response");

          await tx.insert(responseAnswersTable).values(
            orderedFields.map((field, index) => ({
              responseId: response.id,
              fieldId: field.id,
              value: responseAnswers[index] ?? "Skipped",
            }))
          );
        }
      });
    }
  }

  public async signinGuestUser() {
    let existingUser = await this.getUserByEmail({ email: this.guestEmail });

    if (!existingUser) {
      const [createdUser] = await db
        .insert(usersTable)
        .values({
          fullName: "Judges Guest",
          email: this.guestEmail,
          emailVerified: true,
          profileImageUrl:
            "https://api.dicebear.com/9.x/initials/svg?seed=Judges%20Guest",
        })
        .returning();

      if (!createdUser) {
        throw new Error("failed to create guest user");
      }

      existingUser = createdUser;
    }

    await this.ensureGuestDemoData(existingUser.id);

    const { accessToken } = await this.generateAccessToken({ id: existingUser.id });
    const { refreshToken } = await this.generateRefreshToken({ id: existingUser.id });

    await db
      .update(usersTable)
      .set({ refreshToken })
      .where(eq(usersTable.id, existingUser.id));

    return {
      id: existingUser.id,
      accessToken,
      refreshToken,
    };
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
