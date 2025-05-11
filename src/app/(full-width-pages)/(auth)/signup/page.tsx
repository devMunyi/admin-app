import SignUpForm from "@/components/auth/SignUpForm";
import { APP_NAME } from "@/lib/constants";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
  description: `${APP_NAME} Sign up page`,
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
