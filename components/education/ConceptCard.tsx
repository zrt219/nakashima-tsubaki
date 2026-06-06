"use client";

type ConceptCardProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function ConceptCard({ title, description, children }: ConceptCardProps) {
  return (
    <article className="rounded border border-command-line/50 bg-black/30 p-3">
      <h3 className="text-sm font-semibold text-cyan-200">{title}</h3>
      <p className="mt-1 text-xs text-slate-300">{description}</p>
      {children && <div className="mt-3">{children}</div>}
    </article>
  );
}
