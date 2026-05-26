import { motion } from 'framer-motion';
import { Autoplay, EffectCreative, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/effect-creative';
import 'swiper/css/pagination';

import img1 from '../img/Header1.webp';
import img2 from '../img/Header2.webp';
import img3 from '../img/Header3.webp';

const slides = [
  {
    image: img1,
    kicker: 'Infraestructura Vial',
    title: 'Camineria rural en foco',
    subtitle: 'Reporte baches, drenajes y zonas criticas con ubicacion precisa.',
  },
  {
    image: img2,
    kicker: 'Gestion Ciudadana',
    title: 'Seguimiento transparente',
    subtitle: 'Cada reporte genera un codigo para consultar estado en segundos.',
  },
  {
    image: img3,
    kicker: 'Respuesta Territorial',
    title: 'Lavalleja conectada',
    subtitle: 'Un unico canal digital para mejorar la camineria del departamento.',
  },
];

interface HeroCarouselProps {
  isDarkMode: boolean;
}

export function HeroCarousel({ isDarkMode }: HeroCarouselProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-[#E5E1D8] bg-black">
      <Swiper
        modules={[Autoplay, EffectCreative, Pagination]}
        effect="creative"
        creativeEffect={{
          prev: {
            shadow: true,
            translate: ['-22%', 0, -1],
            scale: 0.92,
          },
          next: {
            translate: ['100%', 0, 0],
          },
          limitProgress: 2,
        }}
        loop
        speed={1350}
        autoplay={{
          delay: 5200,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{ clickable: true }}
        className="hero-swiper h-[62vh] min-h-[420px] md:h-[70vh]"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.title}>
            <div className="relative h-full w-full overflow-hidden">
              <img
                src={slide.image}
                alt={slide.title}
                className="h-full w-full scale-[1.05] object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#061632]/90 via-[#0c223f]/35 to-black/15" />
              <div className="absolute inset-0 bg-linear-to-r from-[#0a2040]/50 via-transparent to-transparent" />
              {isDarkMode && <div className="absolute inset-0 bg-black/25" />}

              <div className="absolute inset-0 flex items-end px-6 pb-14 md:px-12 md:pb-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="max-w-3xl rounded-[28px] border border-white/20 bg-white/8 p-6 backdrop-blur-md md:p-8"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/80 md:text-[11px]">
                    {slide.kicker}
                  </p>
                  <h2 className="mt-3 font-serif text-3xl leading-tight text-white md:text-5xl">
                    {slide.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 md:text-base">
                    {slide.subtitle}
                  </p>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-6 md:p-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-white/80 backdrop-blur">
            Formulario activo: Camineria Rural
            <span className="h-1.5 w-1.5 rounded-full bg-[#8dbaf1]" />
            Version inicial
          </div>
        </div>
      </div>

      <style>{`
        .hero-swiper .swiper-pagination {
          bottom: 18px;
        }

        .hero-swiper .swiper-pagination-bullet {
          width: 28px;
          height: 4px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.35);
          opacity: 1;
          transition: all 260ms ease;
        }

        .hero-swiper .swiper-pagination-bullet-active {
          width: 46px;
          background: rgba(255, 255, 255, 0.88);
        }
      `}</style>
    </section>
  );
}
