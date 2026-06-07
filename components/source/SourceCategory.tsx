import { ReactNode } from "react";

type SourceCategoryProps = {
  title: string;
  children: ReactNode;
};

export function SourceCategory({ title, children }: SourceCategoryProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs uppercase tracking-[0.16em] text-cyan-300">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
