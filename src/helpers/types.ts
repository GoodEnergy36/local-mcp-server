import { z } from "zod";

const TokensSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number().int(),
  token_type: z.string(),
  scope: z.string()
});

type Tokens = z.infer<typeof TokensSchema>;

export type { Tokens };
export { TokensSchema };