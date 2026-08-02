type InformationPageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export default function InformationPageHero({
  eyebrow,
  title,
  description,
}: InformationPageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-[#f7f5ff]">
      <div
        aria-hidden="true"
        className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-purple-300/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-indigo-300/25 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-600">{eyebrow}</p>
        ) : null}
        <h1 className={`mx-auto max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-[3.5rem] ${eyebrow ? 'mt-3' : ''}`}>
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}
