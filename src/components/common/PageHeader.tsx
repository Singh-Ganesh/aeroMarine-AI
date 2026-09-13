export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="animate-fade-in mb-1">
      <h1 className="text-[19px] font-semibold text-text-primary">{title}</h1>
      {subtitle && <p className="text-[12.5px] text-text-secondary">{subtitle}</p>}
    </div>
  );
}
