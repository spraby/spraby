import Image from 'next/image';
import {FiGlobe, FiHeart, FiUsers} from 'react-icons/fi';

import {createMetadata} from '@/lib/seo';
import InformationPageHero from '@/theme/sections/information/InformationPageHero';

export const metadata = createMetadata({
  title: 'О нас',
  description: 'Познакомьтесь с командой spraby - маркетплейса авторских товаров, изделий ручной работы и вещей от независимых мастеров.',
  path: '/about',
});

const TEAM = [
  {
    name: 'Михаил',
    role: 'Развитие и маркетинг',
    description: 'Отвечает за стратегическое развитие платформы, партнёрства с мастерами и продвижение бренда.',
    image: '/team/mikhail.jpg',
  },
  {
    name: 'Евгений',
    role: 'Разработка и технологии',
    description: 'Создаёт техническую инфраструктуру spraby, делая платформу удобной, быстрой и надёжной.',
    image: '/team/evgeniy.jpg',
  },
] as const;

const VALUES = [
  {
    title: 'Ручная работа',
    description: 'Мы поддерживаем мастеров, которые создают уникальные изделия вручную',
    icon: FiHeart,
  },
  {
    title: 'Сообщество',
    description: 'Создаём пространство для творческих людей и тех, кто ценит уникальные вещи',
    icon: FiUsers,
  },
  {
    title: 'Экологичность',
    description: 'Продвигаем осознанное потребление и поддерживаем локальное производство',
    icon: FiGlobe,
  },
] as const;

export default function AboutPage() {
  return (
    <main className="overflow-hidden">
      <InformationPageHero
        title="О нас"
        description="Мы создали spraby, чтобы объединить талантливых мастеров и людей, которые ценят уникальные, созданные с душой вещи"
      />

      <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[1.75rem] bg-[#f4f1ff] px-5 py-9 sm:px-8 sm:py-12 lg:grid lg:grid-cols-[0.8fr_1.2fr] lg:gap-14 lg:px-12">
          <div>
            <h2 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">Наша история</h2>
          </div>
          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600 sm:text-base lg:mt-0">
            <p>
              spraby родился из простой идеи: в мире массового производства должно быть место для вещей, созданных с заботой и вниманием к деталям. Мы верим, что за каждым изделием стоит история мастера, его опыт и душа.
            </p>
            <p>
              Наша платформа помогает ремесленникам находить своих покупателей, а людям — открывать для себя уникальные товары, которые невозможно найти в обычных магазинах. Каждая покупка на spraby поддерживает независимых творцов и развивает культуру осознанного потребления.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Наша команда</h2>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-2">
            {TEAM.map(member => (
              <article key={member.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-purple-100">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover object-top"
                      sizes="96px"
                    />
                  </div>
                  <div className="mt-5 min-w-0 sm:ml-5 sm:mt-0">
                    <h3 className="text-xl font-semibold text-slate-900">{member.name}</h3>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-purple-600">{member.role}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{member.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-6 sm:px-6 sm:pb-10 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[1.75rem] bg-[#f4f1ff] px-5 py-9 sm:px-8 sm:py-12 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Наши ценности</h2>
          </div>

          <div className="mt-9 grid gap-3 md:grid-cols-3 lg:gap-4">
            {VALUES.map(value => {
              const Icon = value.icon;

              return (
                <article key={value.title} className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                    <Icon aria-hidden="true" className="h-5 w-5"/>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{value.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{value.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
