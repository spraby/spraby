import {PLATFORM_TOOLS} from './content';

export default function SellerBenefits() {
  return (
      <section id="advantages" className="scroll-mt-24 bg-slate-50/80 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Возможности платформы"
            title="Всё необходимое уже внутри"
            description="Не нужно отдельно собирать сайт, каталог, аналитику и систему работы с заказами."
          />

          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {PLATFORM_TOOLS.map(tool => {
              const Icon = tool.icon;

              return (
                <article
                  key={tool.title}
                  className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_14px_34px_-30px_rgba(15,23,42,0.35)] sm:p-5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <Icon aria-hidden="true" className="h-5 w-5"/>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{tool.title}</h3>
                    <p className="mt-1.5 text-sm leading-5 text-slate-500">{tool.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
  );
}

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

function SectionHeading({eyebrow, title, description}: SectionHeadingProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-600">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">{description}</p>
    </div>
  );
}
