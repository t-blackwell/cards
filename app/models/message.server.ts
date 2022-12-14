import type { message } from "@prisma/client";
import { prisma } from "~/db.server";

export type { message } from "@prisma/client";

export function createMessage({
  text,
  card_id,
  from,
  color_id,
  font_id,
}: Pick<message, "text" | "card_id" | "from" | "color_id" | "font_id">) {
  return prisma.message.create({
    data: {
      text,
      card_id,
      from,
      color_id,
      font_id,
    },
  });
}

export function deleteMessage({ message_id }: Pick<message, "message_id">) {
  return prisma.message.deleteMany({
    where: { message_id },
  });
}