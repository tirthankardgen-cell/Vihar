import { getFirebase } from "@/lib/firebase/client";

export async function accountIdAction(action: string, data: Record<string, unknown>) {
  const user = getFirebase().auth.currentUser;
  if (!user) throw new Error("Sign in to your Vihar ID first.");
  const response = await fetch(`/api/vihar-id/${action}`, { method: "POST", signal: AbortSignal.timeout(15_000), cache: "no-store", headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` }, body: JSON.stringify(data) });
  const result = await response.json();
  if (!response.ok) throw Object.assign(new Error(result.message), { code: result.error });
  return result;
}
