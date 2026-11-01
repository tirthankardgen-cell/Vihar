import { notFound } from "next/navigation";
import { PublicProfile } from "@/components/account/public-profile";
import { normalizeUsername, usernameError } from "@/lib/account/model";
import { pageMetadata } from "@/lib/site";
import { getProfileCardData } from "@/lib/account/profile-card-data";

type Props = { params: Promise<{ username: string }> };
export async function generateMetadata({ params }: Props) {
  const username = normalizeUsername((await params).username);
  const profile = await getProfileCardData(username).catch(() => null);
  const title = profile ? `${profile.displayName} (@${username}) · Vihar ID` : `@${username} · Vihar ID`;
  const image = profile ? `/u/${username}/card?format=preview&v=${profile.version}` : "/images/social-vihar.png";
  return { ...pageMetadata(title, `View @${username} on Vihar. Player profile, game stats and friend connections.`, `/u/${username}`, image), robots: { index: false, follow: false } };
}
export default async function ProfilePage({ params }: Props) {
  const username = normalizeUsername((await params).username);
  if (usernameError(username)) notFound();
  return <PublicProfile key={username} username={username} />;
}
