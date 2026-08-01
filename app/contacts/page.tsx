import {FiArrowRight, FiClock, FiInstagram, FiLifeBuoy, FiMail, FiMapPin, FiSend} from 'react-icons/fi';

import {createMetadata} from '@/lib/seo';
import {SOCIAL_LINKS} from '@/lib/social-links';
import InformationPageHero from '@/theme/sections/information/InformationPageHero';

export const metadata = createMetadata({
  title: 'Контакты',
  description: 'Свяжитесь с командой spraby по вопросам покупок, сотрудничества с мастерами, поддержки продавцов и работы маркетплейса.',
  path: '/contacts',
});

const CONTACTS = [
  {
    title: 'Общие вопросы',
    description: 'По вопросам работы платформы, сотрудничества и предложениям',
    email: 'info@spra.by',
    icon: FiMail,
  },
  {
    title: 'Техническая поддержка',
    description: 'Помощь с использованием сайта и решением технических проблем',
    email: 'support@spra.by',
    icon: FiLifeBuoy,
  },
] as const;

export default function ContactsPage() {
  return (
    <main className="overflow-hidden">
      <InformationPageHero
        title="Контакты"
        description="Мы всегда рады вашим вопросам и предложениям"
      />

      <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 md:grid-cols-2">
            {CONTACTS.map(contact => {
              const Icon = contact.icon;

              return (
                <article key={contact.email} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                    <Icon aria-hidden="true" className="h-5 w-5"/>
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-slate-900">{contact.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{contact.description}</p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-purple-200 px-4 text-sm font-semibold text-purple-700 transition hover:border-purple-300 hover:bg-purple-50"
                  >
                    {contact.email}
                    <FiArrowRight aria-hidden="true" className="h-4 w-4"/>
                  </a>
                </article>
              );
            })}
          </div>

          <div className="mt-4 rounded-[1.75rem] bg-[#f4f1ff] px-5 py-9 sm:px-8 sm:py-12 lg:px-12">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Мы в социальных сетях</h2>
            </div>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <SocialLink
                href={SOCIAL_LINKS.instagram.href}
                label="Instagram"
                handle={SOCIAL_LINKS.instagram.handle}
                icon={FiInstagram}
              />
              <SocialLink
                href={SOCIAL_LINKS.telegram.href}
                label="Telegram"
                handle={SOCIAL_LINKS.telegram.handle}
                icon={FiSend}
              />
            </div>
          </div>

          <article className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <FiMapPin aria-hidden="true" className="h-5 w-5"/>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Юридический адрес</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Республика Беларусь<br/>
                    Минск
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 sm:pt-1">
                <FiClock aria-hidden="true" className="h-4 w-4 shrink-0 text-purple-600"/>
                <span>Время работы: Пн-Пт, 9:00-18:00 (UTC+3)</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

type SocialLinkProps = {
  href: string;
  label: string;
  handle: string;
  icon: typeof FiInstagram;
};

function SocialLink({href, label, handle, icon: Icon}: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-purple-100 bg-white px-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-purple-200"
    >
      <Icon aria-hidden="true" className="h-5 w-5 text-purple-600"/>
      <span>
        <strong className="block text-sm font-semibold text-slate-900">{label}</strong>
        <span className="block text-xs text-slate-500">{handle}</span>
      </span>
    </a>
  );
}
