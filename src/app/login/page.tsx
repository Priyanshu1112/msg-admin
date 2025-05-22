// app/(auth)/login/page.tsx
import SignInPage from "./sign-in";

export const metadata = {
  title: "Sign In | MSG Admin",
  description: "Secure login for administrators to access MSG dashboard",
};

export default function Page() {
  return <SignInPage />;
}
