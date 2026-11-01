import { notFound } from "next/navigation";
import { PublicProfile } from "@/components/account/public-profile";
import { normalizeUsername, usernameError } from "@/lib/account/model";
import { pageMetadata } from "@/lib/site";
import "../../account.css";

type Props = { params: Promise<{ username: string }> };
export async function generateMetadata({ params }: Props) {
  const username = normalizeUsername((await params).username);
  return { ...pageMetadata(`@${username} · Vihar ID`, `View @${username} on Vihar. Player profile, game stats and friend connections.`, `/u/${username}`), robots: { index: false, follow: false } };
}
export default async function ProfilePage({ params }: Props) {
  const username = normalizeUsername((await params).username);
  if (usernameError(username)) notFound();
  return <PublicProfile key={username} username={username} />;
}
