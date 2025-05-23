import { TrailsSection, TrailsSectionProps } from './trail-section';
import trail1 from '../../../public/images/trails/A-Jornada-do-Sirsasana.png';
import trail2 from '../../../public/images/trails/Meditando-Tecnicas-de-Como-Comecar.png';
import trail3 from '../../../public/images/trails/O-Caminho-Do-Espacate.png';
import trail4 from '../../../public/images/trails/O-Caminho-Da-Forca-1.png';
import trail5 from '../../../public/images/trails/Detox-Total.png';
import trail6 from '../../../public/images/trails/O-Caminho-Do-Yogi-Primeiros-Passos.png';
import trail7 from '../../../public/images/trails/O-Caminho-da-Flexibilidade-1.png';

const trails: TrailsSectionProps = {
  title: 'trilhas',
  actionLabel: 'mostrar mais',
  onActionClick: () => {},
  trails: [
    {
      id: '1',
      imageUrl: trail1.src,
      href: '/trails/1',
    },
    {
      id: '2',
      imageUrl: trail2.src,
      href: '/trails/2',
    },
    {
      id: '3',
      imageUrl: trail3.src,
      href: '/trails/3',
    },
    {
      id: '4',
      imageUrl: trail4.src,
      href: '/trails/4',
    },
    {
      id: '5',
      imageUrl: trail5.src,
      href: '/trails/5',
    },
    {
      id: '6',
      imageUrl: trail6.src,
      href: '/trails/6',
    },
    {
      id: '7',
      imageUrl: trail7.src,
      href: '/trails/7',
    },
  ],
};

export function TrailsDashboardSection() {
  return (
    <section id="trails" aria-label="Trails" className="bg-white py-2">
      {/* <div className="mx-auto max-w-2xl md:text-center">
          <h2 className="text-3xl font-medium tracking-tight text-brand-yoka-purple-800 sm:text-4xl">
            conheça nossas trilhas
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            cada trilha é uma jornada para o seu corpo e mente
          </p>
        </div> */}
      <TrailsSection {...trails} />
    </section>
  );
}
