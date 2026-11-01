import "@/app/content.css";

export function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="page-intro page-hero">
      <p className="eyebrow"><span className="tiny-spark" aria-hidden="true">✳</span>{eyebrow}</p>
      <h1>{title}</h1>
      <p className="page-description">{description}</p>
    </div>
  );
}
