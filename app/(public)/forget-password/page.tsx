import { redirect } from "next/navigation";

/** Redirect the old typo route to the correct one. */
export default function ForgetPasswordRedirect() {
  redirect("/forgot-password");
}
