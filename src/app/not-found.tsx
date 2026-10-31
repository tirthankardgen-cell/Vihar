import Link from "@/components/site-link";
import { ArrowLeft, ArrowUpRight, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container not-found">
      <Compass aria-hidden="true" />
      <p className="eyebrow">404 / A little off the beaten path</p>
      <h1>This way leads<br /><em>somewhere else.</em></h1>
      <p>We couldn’t find that page. There are still a few good worlds waiting to be explored.</p>
      <div className="not-found-actions"><Link href="/" className="button button-outline"><ArrowLeft size={17} aria-hidden="true" />Back home</Link><Link href="/games" className="button button-dark">Explore games <ArrowUpRight size={17} aria-hidden="true" /></Link></div>
    </div>
  );
}
