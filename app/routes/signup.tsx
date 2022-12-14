import { Box, Button, Link, TextField, Typography } from "@mui/material";
import { json, redirect } from "@remix-run/node";
import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import {
  Form,
  Link as RemixLink,
  useActionData,
  useSearchParams,
} from "@remix-run/react";
import * as React from "react";
import Logo from "~/components/Logo";
import Page from "~/components/Page";
import { createUser, getUserByEmail } from "~/models/user.server";
import { getUserId, setEmailVerify } from "~/session.server";
import styles from "~/styles/signup.css";
import { validateEmail } from "~/utils";

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null } },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { email: null, password: "Password is required" } },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return json(
      { errors: { email: null, password: "Password is too short" } },
      { status: 400 }
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json(
      {
        errors: {
          email: "A user already exists with this email",
          password: null,
        },
      },
      { status: 400 }
    );
  }

  await createUser(email, password);

  return await setEmailVerify(request, email);
}

export const meta: MetaFunction = () => {
  return {
    title: "Sign up · Caardvark",
  };
};

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function SignUp() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData();
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Page className="SignUp" maxWidth="xs">
      <Box className="SignUp__logo">
        <Logo size="medium" />
      </Box>
      <Form className="SignUp__box" method="post" noValidate>
        <Typography className="SignUp__title" variant="h5">
          Sign up
        </Typography>
        <TextField
          autoComplete="email"
          autoFocus={true}
          className="SignUp__input"
          error={actionData?.errors?.email !== undefined}
          helperText={actionData?.errors?.email}
          id="email"
          label="Email address"
          name="email"
          ref={emailRef}
          required
          type="email"
        />

        <TextField
          autoComplete="current-password"
          className="SignUp__input"
          error={actionData?.errors?.password !== undefined}
          helperText={actionData?.errors?.password}
          id="password"
          label="Password"
          name="password"
          ref={passwordRef}
          required
          type="password"
        />

        <input type="hidden" name="redirectTo" value={redirectTo} />

        <Button
          className="SignUp__button"
          color="primary"
          disableElevation
          type="submit"
          variant="contained"
        >
          Create Account
        </Button>
        <Typography variant="caption">
          Already have an account?{" "}
          <Link
            component={RemixLink}
            to={{
              pathname: "/login",
              search: searchParams.toString(),
            }}
          >
            Log in
          </Link>
        </Typography>
      </Form>
    </Page>
  );
}
