import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { hashPassword, verifyPassword } from "../packages/services/utils/password";
import { buildResponseAnswersSchema } from "../packages/services/response/validation";
import { assertRateLimit } from "../packages/trpc/server/utils/rate-limit";

const originalFetch = globalThis.fetch;
const originalRedisUrl = process.env.UPSTASH_REDIS_REST_URL;
const originalRedisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env.UPSTASH_REDIS_REST_URL = originalRedisUrl;
  process.env.UPSTASH_REDIS_REST_TOKEN = originalRedisToken;
});

test("auth passwords are hashed and verified with scrypt", async () => {
  const password = "JudgeReady123";
  const hashedPassword = await hashPassword(password);

  assert.match(hashedPassword, /^scrypt\$v1\$/);
  assert.equal(
    await verifyPassword({ password, storedHash: hashedPassword }),
    true
  );
  assert.equal(
    await verifyPassword({ password: "wrong-password", storedHash: hashedPassword }),
    false
  );
});

test("rate limiter uses Upstash Redis REST when configured", async () => {
  const calls: unknown[] = [];
  const key = `integration:${Date.now()}`;
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
  globalThis.fetch = (async (_url, init) => {
    calls.push(JSON.parse(String(init?.body)));
    return Response.json([{ result: 1 }, { result: 1 }]);
  }) as typeof fetch;

  await assertRateLimit({
    key,
    limit: 1,
    windowMs: 1000,
  });

  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], [
    ["INCR", `rate-limit:${key}`],
    ["PEXPIRE", `rate-limit:${key}`, "1000", "NX"],
  ]);
});

test("dynamic response schema validates conditionally visible fields", async () => {
  const fields = [
    {
      id: "00000000-0000-4000-8000-000000000001",
      label: "Do you want follow up?",
      type: "yes_no",
      required: true,
      options: ["Yes", "No"],
      validationRules: null,
    },
    {
      id: "00000000-0000-4000-8000-000000000002",
      label: "Email for follow up",
      type: "email",
      required: true,
      options: null,
      validationRules: {
        showWhen: {
          fieldId: "00000000-0000-4000-8000-000000000001",
          equals: "Yes",
        },
      },
    },
  ];
  const schema = buildResponseAnswersSchema(fields);

  await assert.doesNotReject(() =>
    schema.parseAsync([
      {
        fieldId: "00000000-0000-4000-8000-000000000001",
        value: "No",
      },
    ])
  );

  await assert.rejects(() =>
    schema.parseAsync([
      {
        fieldId: "00000000-0000-4000-8000-000000000001",
        value: "Yes",
      },
    ])
  );

  await assert.doesNotReject(() =>
    schema.parseAsync([
      {
        fieldId: "00000000-0000-4000-8000-000000000001",
        value: "Yes",
      },
      {
        fieldId: "00000000-0000-4000-8000-000000000002",
        value: "judge@example.com",
      },
    ])
  );
});
