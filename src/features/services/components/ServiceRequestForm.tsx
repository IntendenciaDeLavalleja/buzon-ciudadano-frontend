import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { z } from 'zod';

const serviceRequestSchema = z.object({
  full_name: z.string().min(3, 'El nombre completo es obligatorio'),
  email: z.string().email('Correo electronico invalido'),
  phone: z.string().min(7, 'El telefono es obligatorio'),
  document_number: z.string().min(5, 'El documento es obligatorio'),
  service_type: z.enum(['tramites', 'permisos', 'certificados', 'inspeccion']),
  subject: z.string().min(5, 'El asunto es obligatorio'),
  description: z.string().min(20, 'La descripcion debe tener al menos 20 caracteres').max(2000, 'Maximo 2000 caracteres'),
  preferred_channel: z.enum(['email', 'whatsapp', 'llamada']),
  urgency: z.enum(['baja', 'media', 'alta']),
  acceptedDataPolicy: z.literal(true, {
    error: 'Debe aceptar la politica de privacidad para continuar',
  }),
});

type ServiceRequestFormData = z.infer<typeof serviceRequestSchema>;

type ServiceTypeOption = {
  value: ServiceRequestFormData['service_type'];
  title: string;
  description: string;
};

const serviceTypeOptions: ServiceTypeOption[] = [
  {
    value: 'tramites',
    title: 'Tramites generales',
    description: 'Turnos, constancias, estados de expediente y gestiones de mesa de entrada.',
  },
  {
    value: 'permisos',
    title: 'Permisos y habilitaciones',
    description: 'Obras, ocupaciones de via publica, eventos y solicitudes especiales.',
  },
  {
    value: 'certificados',
    title: 'Certificados y constancias',
    description: 'Documentacion para domicilio, residencia, situacion tributaria y similares.',
  },
  {
    value: 'inspeccion',
    title: 'Inspecciones',
    description: 'Relevamientos, revisiones tecnicas y seguimiento con area responsable.',
  },
];

const urgencyOptions: Array<{ value: ServiceRequestFormData['urgency']; label: string }> = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
];

const channelOptions: Array<{ value: ServiceRequestFormData['preferred_channel']; label: string }> = [
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'llamada', label: 'Llamada' },
];

const errorVariants = {
  hidden: { opacity: 0, height: 0, overflow: 'hidden' },
  visible: { opacity: 1, height: 'auto', transition: { duration: 0.25, ease: 'easeOut' as const } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
};

function AnimatedSection({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({
  step,
  title,
  subtitle,
  tone,
  isDarkMode,
}: {
  step: string;
  title: string;
  subtitle: string;
  tone: 'sand' | 'sky';
  isDarkMode: boolean;
}) {
  const toneClasses = tone === 'sand'
    ? isDarkMode
      ? 'bg-[#141414] text-white/70 border-white/10'
      : 'bg-amber-100 text-amber-900 border-amber-200'
    : isDarkMode
      ? 'bg-[#141414] text-white/70 border-white/10'
      : 'bg-sky-100 text-sky-900 border-sky-200';

  return (
    <div className="flex items-start gap-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-xs font-black uppercase tracking-[0.2em] ${toneClasses}`}>
        {step}
      </div>
      <div>
        <h3 className={`text-xl md:text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#17335D]'}`}>{title}</h3>
        <p className={`mt-1 text-sm leading-relaxed max-w-2xl ${isDarkMode ? 'text-white/55' : 'text-slate-500'}`}>{subtitle}</p>
      </div>
    </div>
  );
}

function FieldError({ message, isDarkMode }: { message?: string; isDarkMode: boolean }) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.p
          variants={errorVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`mt-1.5 text-xs font-medium ${isDarkMode ? 'text-rose-400' : 'text-rose-500'}`}
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

interface ServiceRequestFormProps {
  isDarkMode: boolean;
}

export function ServiceRequestForm({ isDarkMode }: ServiceRequestFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceRequestFormData>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      document_number: '',
      service_type: 'tramites',
      subject: '',
      description: '',
      preferred_channel: 'email',
      urgency: 'media',
      acceptedDataPolicy: true,
    },
  });

  const selectedType = watch('service_type');
  const selectedUrgency = watch('urgency');
  const selectedChannel = watch('preferred_channel');

  const onSubmit = async (data: ServiceRequestFormData) => {
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    const selectedOption = serviceTypeOptions.find((option) => option.value === data.service_type);

    toast.success(`Solicitud recibida. Categoria: ${selectedOption?.title ?? 'Tramites generales'}`);
    setIsSubmitted(true);
    reset({
      full_name: '',
      email: '',
      phone: '',
      document_number: '',
      service_type: 'tramites',
      subject: '',
      description: '',
      preferred_channel: 'email',
      urgency: 'media',
      acceptedDataPolicy: true,
    });

    window.setTimeout(() => setIsSubmitted(false), 2200);
  };

  const labelClass = `block text-[11px] font-black mb-1.5 ml-0.5 uppercase tracking-[0.18em] ${isDarkMode ? 'text-white/35' : 'text-slate-500'}`;
  const inputClass = `w-full rounded-2xl border px-4 py-3.5 outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${
    isDarkMode
      ? 'border-white/10 bg-[#111111] text-white/88 focus:border-[#3A7BD5] focus:ring-[#3A7BD5]/15'
      : 'border-slate-200 bg-white text-slate-800 focus:border-sky-400 focus:ring-sky-100'
  }`;
  const textareaClass = `${inputClass} min-h-[170px] resize-none`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-[30px] border shadow-[0_24px_60px_rgba(15,23,42,0.08)] ${
        isDarkMode
          ? 'border-white/8 bg-[#151515]'
          : 'border-slate-200 bg-[#FFFFFF]'
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${isDarkMode ? 'bg-[#3A7BD5]' : 'bg-[#17335D]'}`} />
      <div className={`absolute -right-28 top-0 h-64 w-64 rounded-full blur-3xl ${isDarkMode ? 'bg-[#3A7BD5]/8' : 'bg-[#3A7BD5]/10'}`} />
      <div className={`absolute -left-24 bottom-0 h-56 w-56 rounded-full blur-3xl ${isDarkMode ? 'bg-[#C59B4F]/8' : 'bg-[#C59B4F]/10'}`} />

      <div className="relative grid gap-8 px-6 py-6 md:px-8 md:py-8 xl:grid-cols-[1.1fr_0.9fr] xl:gap-10">
        <div className="space-y-8">
          <AnimatedSection>
            <SectionTitle
              step="01"
              title="Solicitud de tramites y servicios"
              subtitle="Un espacio pensado para registrar pedidos con claridad, prioridad y trazabilidad. Ordena la solicitud desde el primer momento y deja toda la informacion lista para su analisis."
              tone="sand"
              isDarkMode={isDarkMode}
            />
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid gap-4 md:grid-cols-3">
              <div className={`rounded-3xl border p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] ${isDarkMode ? 'border-white/8 bg-[#141414]' : 'border-slate-200 bg-white'}`}>
                <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Seguimiento</p>
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-white/65' : 'text-slate-600'}`}>Estado claro y canal de contacto preferido desde el inicio.</p>
              </div>
              <div className={`rounded-3xl border p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] ${isDarkMode ? 'border-white/8 bg-[#141414]' : 'border-slate-200 bg-white'}`}>
                <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Orden</p>
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-white/65' : 'text-slate-600'}`}>Cada tramite queda clasificado por tipo, urgencia y asunto.</p>
              </div>
              <div className={`rounded-3xl border p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] ${isDarkMode ? 'border-white/8 bg-[#141414]' : 'border-slate-200 bg-white'}`}>
                <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Respuesta</p>
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-white/65' : 'text-slate-600'}`}>Una experiencia limpia, rapida y amigable para el vecino.</p>
              </div>
            </div>
          </AnimatedSection>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <AnimatedSection className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Nombre completo</label>
                  <input {...register('full_name')} type="text" placeholder="Como figura en su documento" className={inputClass} />
                  <FieldError message={errors.full_name?.message} isDarkMode={isDarkMode} />
                </div>
                <div>
                  <label className={labelClass}>Documento</label>
                  <input {...register('document_number')} type="text" placeholder="CI o pasaporte" className={inputClass} />
                  <FieldError message={errors.document_number?.message} isDarkMode={isDarkMode} />
                </div>
                <div>
                  <label className={labelClass}>Correo electronico</label>
                  <input {...register('email')} type="email" placeholder="ejemplo@correo.com" className={inputClass} />
                  <FieldError message={errors.email?.message} isDarkMode={isDarkMode} />
                </div>
                <div>
                  <label className={labelClass}>Telefono</label>
                  <input {...register('phone')} type="tel" placeholder="099 123 456" className={inputClass} />
                  <FieldError message={errors.phone?.message} isDarkMode={isDarkMode} />
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection className="space-y-4">
              <div>
                <p className={labelClass}>Tipo de solicitud</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {serviceTypeOptions.map((option) => {
                    const isSelected = selectedType === option.value;

                    return (
                      <label
                        key={option.value}
                        className={`group relative flex cursor-pointer rounded-3xl border p-4 transition-all ${
                          isSelected
                            ? isDarkMode
                              ? 'border-[#C59B4F]/35 bg-[#1B1B1B] shadow-[0_16px_35px_rgba(0,0,0,0.28)]'
                              : 'border-[#3A7BD5] bg-[#EFF6FF] shadow-[0_16px_35px_rgba(58,123,213,0.14)]'
                            : isDarkMode
                              ? 'border-white/8 bg-[#141414] hover:border-white/12 hover:bg-[#171717]'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-[0_12px_25px_rgba(15,23,42,0.05)]'
                        }`}
                      >
                        <input {...register('service_type')} value={option.value} type="radio" className="sr-only" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-4">
                            <span className={`text-sm font-bold ${isDarkMode ? 'text-white/88' : 'text-slate-800'}`}>{option.title}</span>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                              isSelected
                                ? isDarkMode
                                  ? 'bg-[#C59B4F] text-[#111111]'
                                  : 'bg-[#3A7BD5] text-white'
                                : isDarkMode
                                  ? 'bg-white/8 text-white/55'
                                  : 'bg-slate-100 text-slate-500'
                            }`}>
                              {isSelected ? 'Elegido' : 'Opcion'}
                            </span>
                          </div>
                          <p className={`mt-2 text-sm leading-relaxed ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>{option.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <FieldError message={errors.service_type?.message} isDarkMode={isDarkMode} />
              </div>

              <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <label className={labelClass}>Asunto</label>
                  <input {...register('subject')} type="text" placeholder="Ej: Solicitud de certificacion de domicilio" className={inputClass} />
                  <FieldError message={errors.subject?.message} isDarkMode={isDarkMode} />
                </div>
                <div>
                  <p className={labelClass}>Urgencia</p>
                  <div className="grid grid-cols-3 gap-2">
                    {urgencyOptions.map((option) => {
                      const isSelected = selectedUrgency === option.value;

                      return (
                        <label
                          key={option.value}
                          className={`flex cursor-pointer items-center justify-center rounded-2xl border px-3 py-3 text-xs font-bold uppercase tracking-[0.18em] transition-all ${
                            isSelected
                              ? isDarkMode
                                ? 'border-[#C59B4F]/35 bg-[#1B1B1B] text-white'
                                : 'border-[#17335D] bg-[#17335D] text-white'
                              : isDarkMode
                                ? 'border-white/8 bg-[#141414] text-white/55 hover:border-white/12'
                                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          <input {...register('urgency')} value={option.value} type="radio" className="sr-only" />
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection className="space-y-4">
              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <label className={labelClass}>Descripcion del pedido</label>
                  <textarea {...register('description')} placeholder="Contanos que necesitas, donde ocurre y cualquier detalle que ayude a resolverlo mejor." className={textareaClass} />
                  <FieldError message={errors.description?.message} isDarkMode={isDarkMode} />
                </div>

                  <div className={`space-y-4 rounded-3xl border p-5 ${isDarkMode ? 'border-white/8 bg-[#141414]' : 'border-slate-200 bg-slate-50'}`}>
                  <div>
                      <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Canal preferido</p>
                    <div className="mt-3 grid gap-2">
                      {channelOptions.map((option) => {
                        const isSelected = selectedChannel === option.value;

                        return (
                          <label
                            key={option.value}
                            className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-all ${
                              isSelected
                                  ? isDarkMode
                                    ? 'border-[#C59B4F]/50 bg-[#111111] text-white shadow-[0_10px_24px_rgba(197,155,79,0.12)]'
                                    : 'border-[#C59B4F] bg-white text-[#17335D] shadow-[0_10px_24px_rgba(197,155,79,0.12)]'
                                  : isDarkMode
                                    ? 'border-white/8 bg-[#111111]/70 text-white/55 hover:border-white/15'
                                    : 'border-slate-200 bg-white/70 text-slate-500 hover:border-slate-300'
                            }`}
                          >
                            <span className="font-semibold">{option.label}</span>
                              <input {...register('preferred_channel')} value={option.value} type="radio" className={isDarkMode ? 'accent-[#C59B4F]' : 'accent-[#17335D]'} />
                          </label>
                        );
                      })}
                    </div>
                  </div>

                    <div className={`rounded-3xl p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)] ${isDarkMode ? 'bg-[#111111] border border-white/8' : 'bg-white'}`}>
                      <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Resumen</p>
                      <div className={`mt-3 space-y-2 text-sm ${isDarkMode ? 'text-white/60' : 'text-slate-600'}`}>
                      <div className="flex items-center justify-between gap-3">
                        <span>Solicitud</span>
                          <span className={`font-semibold ${isDarkMode ? 'text-white/85' : 'text-slate-800'}`}>{serviceTypeOptions.find((option) => option.value === selectedType)?.title}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Urgencia</span>
                          <span className={`font-semibold ${isDarkMode ? 'text-white/85' : 'text-slate-800'}`}>{selectedUrgency}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Contacto</span>
                          <span className={`font-semibold ${isDarkMode ? 'text-white/85' : 'text-slate-800'}`}>{selectedChannel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection className="space-y-4">
                <div className={`rounded-3xl border p-5 ${isDarkMode ? 'border-white/8 bg-[#141414]' : 'border-slate-200 bg-white'}`}>
                <label className="flex items-start gap-3 cursor-pointer">
                    <input {...register('acceptedDataPolicy')} type="checkbox" className={`mt-0.5 h-4 w-4 shrink-0 rounded ${isDarkMode ? 'border-white/20 accent-[#C59B4F]' : 'border-slate-300 accent-[#17335D]'}`} />
                    <span className={`text-sm leading-relaxed ${isDarkMode ? 'text-white/60' : 'text-slate-600'}`}>
                    Acepto la politica de privacidad y autorizo el tratamiento de mis datos para la gestion de la solicitud de tramite o servicio.
                  </span>
                </label>
                  <FieldError message={errors.acceptedDataPolicy?.message} isDarkMode={isDarkMode} />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={isSubmitting}
                type="submit"
                className={`inline-flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_18px_40px_rgba(23,51,93,0.22)] transition-opacity disabled:cursor-not-allowed disabled:opacity-60 ${isDarkMode ? 'bg-[#C59B4F] text-[#111111]' : 'bg-[#17335D]'}`}
              >
                {isSubmitting ? 'Enviando solicitud...' : 'Enviar solicitud'}
              </motion.button>
            </AnimatedSection>
          </form>

          <AnimatePresence>
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`rounded-3xl border px-5 py-4 text-sm font-medium ${isDarkMode ? 'border-emerald-900/40 bg-emerald-950/25 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}
              >
                La solicitud quedo preparada para seguimiento. Si necesitabas un ajuste, podras cargar otra en unos segundos.
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <div className={`overflow-hidden rounded-[28px] border p-6 shadow-[0_24px_50px_rgba(23,51,93,0.18)] ${isDarkMode ? 'border-white/8 bg-[#121212] text-white' : 'border-slate-200 bg-[#17335D] text-white'}`}>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/55">Guia rapida</p>
            <h4 className="mt-3 text-2xl font-semibold leading-tight">Pensado para que el vecino complete todo en menos de unos minutos.</h4>
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              El formulario prioriza claridad, canal de respuesta y urgencia. Eso ayuda a que el equipo derive el tramite correcto sin perder tiempo.
            </p>
          </div>

          <div className="grid gap-4">
            <div className={`rounded-3xl border p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] ${isDarkMode ? 'border-white/8 bg-[#141414]' : 'border-slate-200 bg-white'}`}>
              <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Que podes pedir</p>
              <ul className={`mt-3 space-y-2 text-sm ${isDarkMode ? 'text-white/60' : 'text-slate-600'}`}>
                <li>Tramites administrativos y constancias.</li>
                <li>Permisos, inspecciones y habilitaciones.</li>
                <li>Seguimiento con canal de contacto preferido.</li>
              </ul>
            </div>

            <div className={`rounded-3xl border p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] ${isDarkMode ? 'border-white/8 bg-[#141414]' : 'border-slate-200 bg-white'}`}>
              <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Recomendacion</p>
              <p className={`mt-3 text-sm leading-relaxed ${isDarkMode ? 'text-white/60' : 'text-slate-600'}`}>
                Si el pedido tiene ubicacion exacta o documentos de respaldo, adjuntalos en la descripcion para acelerar la gestion.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </motion.section>
  );
}