import { selectCardTemplateColumns } from "./card_template.server";
import type { card, user } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

export type { card } from "@prisma/client";

const selectCardColumns = {
  card_id: true,
  hash: true,
  card_template_id: true,
  from: true,
  to: true,
  published_date: true,
  deleted: true,
  created_date: true,
  updated_date: true,
  card_template: true,
  user_id: true,
};

const selectMessageColumns = {
  message_id: true,
  from: true,
  text: true,
  color: true,
  font: true,
  image_url: true,
  deleted: true,
  created_date: true,
  updated_date: true,
};

export async function getCard({ hash }: Pick<card, "hash">) {
  return prisma.card.findFirst({
    select: {
      ...selectCardColumns,
      card_template: { select: selectCardTemplateColumns },
    },
    where: { hash, deleted: "N" },
  });
}

export async function getCardWithMessages({ hash }: Pick<card, "hash">) {
  return prisma.card.findFirst({
    select: {
      ...selectCardColumns,
      message: {
        select: {
          ...selectMessageColumns,
        },
      },
    },
    where: { hash, deleted: "N" },
  });
}

export function getCardListItems({ user_id }: { user_id: user["user_id"] }) {
  return prisma.card.findMany({
    where: { user_id, deleted: "N" },
    select: selectCardColumns,
    orderBy: { updated_date: "desc" },
  });
}

interface createCardProps
  extends Pick<card, "card_template_id" | "from" | "to"> {
  user_id: user["user_id"];
}

export function createCard({
  user_id,
  card_template_id,
  from,
  to,
}: createCardProps) {
  return prisma.card.create({
    data: {
      hash: uuidv4(),
      from,
      to,
      card_template: {
        connect: {
          card_template_id,
        },
      },
      user: {
        connect: {
          user_id,
        },
      },
    },
  });
}

export async function deleteCard({
  request,
  card_id,
}: Pick<card, "card_id"> & {
  request: Request;
}) {
  const userId = await requireUserId(request);

  return prisma.card.update({
    data: { deleted: "Y" },
    where: { card_id, user_id: userId },
  });
}

export async function updateCard({
  request,
  card_id,
  from,
  to,
}: Pick<card, "card_id" | "from" | "to"> & {
  request: Request;
}) {
  const userId = await requireUserId(request);

  return prisma.card.update({
    data: { from, to, updated_date: new Date() },
    where: { card_id, user_id: userId },
  });
}

export async function publishCard({
  request,
  card_id,
}: Pick<card, "card_id"> & {
  request: Request;
}) {
  const userId = await requireUserId(request);

  return prisma.card.update({
    data: { published_date: new Date() },
    where: { card_id, user_id: userId, published_date: null },
  });
}
