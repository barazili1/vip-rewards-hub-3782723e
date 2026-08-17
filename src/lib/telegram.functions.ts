import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sendRegistration } from "./telegram.server";

export const submitRegistration = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        userId: z.string().min(1),
        telegramUser: z.string().min(1),
        depositShot: z.string().startsWith("data:image/"),
        idShot: z.string().startsWith("data:image/"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => sendRegistration(data));

export const verifyTelegramUser = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ username: z.string().min(1) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { telegramUserExists } = await import("./telegram.server");
    return { exists: await telegramUserExists(data.username) };
  });
