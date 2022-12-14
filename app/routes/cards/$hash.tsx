import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { deleteCard, getCard } from "~/models/card.server";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  const user_id = await requireUserId(request);
  invariant(params.hash, "hash not found");

  const card = await getCard({ user_id, hash: params.hash });
  if (!card) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ card });
}

export async function action({ request, params }: ActionArgs) {
  const user_id = await requireUserId(request);
  const formData = await request.formData();

  const cardId = Number(formData.get("card_id"));
  invariant(!isNaN(cardId), "card not found");

  await deleteCard({ user_id, card_id: cardId });

  return redirect("/cards");
}

export default function CardDetailsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h3>{`From "${data.card.from}" to "${data.card.to}"`}</h3>
      <p>{`card_template_id = ${data.card.card_template_id} `}</p>
      <p>{`created_date = ${data.card.created_date}`}</p>
      <p>{`updated_date = ${data.card.updated_date}`}</p>
      <p>{`published_date = ${data.card.published_date}`}</p>
      <p>{`deleted = ${data.card.deleted}`}</p>
      <hr />
      <Form method="post">
        <input type="hidden" name="card_id" value={data.card.card_id} />
        <button type="submit">Delete</button>
      </Form>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Card not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
