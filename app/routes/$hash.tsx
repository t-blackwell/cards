import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import MessageCard from "~/components/MessageCard";
import { getCardWithMessages } from "~/models/card.server";
import { deleteMessage } from "~/models/message.server";
import { getUserId } from "~/session.server";
import styles from "~/styles/$hash.css";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await getUserId(request);
  invariant(params.hash, "hash not found");

  const card = await getCardWithMessages({ hash: params.hash });
  if (!card) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ card, userId: userId });
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "delete") {
    const messageId = formData.get("messageId");
    const cardOwnerId = formData.get("cardOwnerId");
    invariant(messageId, "Error");
    invariant(cardOwnerId, "Error");

    await deleteMessage({
      request,
      cardOwnerId: Number(cardOwnerId),
      message_id: Number(messageId),
    });
  }
  return redirect(".");
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function ViewCardPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="ViewCard">
      <h3 className="text-2xl font-bold">{`From "${data.card.from}" to "${data.card.to}"`}</h3>
      <hr className="my-4" />
      <div className="ViewCard__messageContainer">
        {data.card.message.map((message) => (
          <MessageCard
            message={message}
            isOwner={data.userId === data.card.user_id}
            key={message.message_id}
          />
        ))}
      </div>
    </div>
  );
}
