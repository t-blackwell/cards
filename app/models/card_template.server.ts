import type { card_template } from "@prisma/client";
import { prisma } from "~/db.server";

export type { card_template } from "@prisma/client";

export const selectCardTemplateColumns = {
  card_template_id: true,
  text: true,
  text_css: true,
  bg_css: true,
  card_type_id: true,
};

export function getCardTemplate({
  card_template_id,
}: Pick<card_template, "card_template_id">) {
  return prisma.card_template.findFirst({
    select: selectCardTemplateColumns,
    where: { card_template_id },
  });
}

export function getCardTemplates() {
  return prisma.card_template.findMany({
    select: selectCardTemplateColumns,
  });
}
