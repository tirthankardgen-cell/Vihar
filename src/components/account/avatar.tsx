import Image from "next/image";
import { avatars, type AvatarId } from "@/lib/account/model";

export function Avatar({ id, size = 64, className = "" }: { id: AvatarId; size?: number; className?: string }) {
  const avatar = avatars.find((item) => item.id === id) || avatars[0];
  return <Image src={`/avatars/${avatar.id}.svg`} alt={`${avatar.name} avatar`} width={size} height={size} className={`player-avatar ${className}`} unoptimized />;
}
export function AvatarPicker({ value, onChange, disabled = false }: { value: AvatarId; onChange: (id: AvatarId) => void; disabled?: boolean }) {
  return <fieldset className="avatar-picker" disabled={disabled}><legend>Choose your avatar</legend><div>{avatars.map((avatar) => <button key={avatar.id} type="button" aria-label={`${avatar.name} avatar`} aria-pressed={value === avatar.id} onClick={() => onChange(avatar.id)}><Avatar id={avatar.id} size={64} /><span>{avatar.name}</span></button>)}</div></fieldset>;
}
