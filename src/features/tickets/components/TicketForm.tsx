import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { ticketSchema, type TicketFormData } from "../schema";
import { MapModal } from "./MapModal";
import { useCreateTicket } from "../hooks";
import { useOptimizedImage } from "../hooks/useOptimizedImage";
import { formatBytes } from "../../../utils/optimizeImage";

const errorVariants = {
  hidden: { opacity: 0, height: 0, overflow: "hidden" },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
};

// Shared scroll-entrance animation for each section
function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function DividerSection({ num, title, isDarkMode }: { num: string; title: string; isDarkMode: boolean }) {
  return (
    <div className="pb-3">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm shadow-md flex-shrink-0">
          {num}
        </span>
        <h3 className={`text-base font-bold tracking-tight ${isDarkMode ? "text-white/80" : "text-gray-800"}`}>
          {title}
        </h3>
        <div className={`flex-1 h-px bg-gradient-to-r ${isDarkMode ? "from-white/10 to-transparent" : "from-gray-200 to-transparent"}`} />
      </div>
    </div>
  );
}

interface TicketFormProps {
  isDarkMode: boolean;
  isLowVision?: boolean;
  onSuccess?: (code: string) => void;
}

export const TicketForm: React.FC<TicketFormProps> = ({ isDarkMode, onSuccess }) => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const createTicket = useCreateTicket();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { municipality_or_destination: "Intendencia de Lavalleja", category: "camineria_rural", location: { lat: 0, lng: 0 } },
  });

  const location = watch("location");
  const hasLocation = location && (location.lat !== 0 || location.lng !== 0);

  const {
    isOptimizing,
    error: imageOptimizationError,
    result: imageOptimizationResult,
    originalFile,
    optimizedFile,
    statusMessage,
    setOriginalFile,
    reset: resetImage,
  } = useOptimizedImage();

  // Inyectamos el ref al input file para poder limpiarlo tras un envío exitoso.
  const { ref: rhfRef, ...fileReg } = register("file");
  const fileInputRefCallback = (el: HTMLInputElement | null) => {
    rhfRef(el);
    fileInputRef.current = el;
  };

  // Limpia el estado de optimización al desmontar el formulario.
  useEffect(() => {
    return () => {
      resetImage();
    };
  }, [resetImage]);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    fileReg.onChange(event);
    const next = event.target.files?.[0] ?? null;
    if (!next) {
      setOriginalFile(null);
      // Reconstruimos un FileList vacío para mantener la coherencia con RHF.
      setValue("file", new DataTransfer().files, { shouldValidate: true });
      return;
    }
    // Sincronizamos el FileList del form con el archivo original seleccionado
    // (las validaciones de tipo y 30MB se aplican sobre el original).
    const dt = new DataTransfer();
    dt.items.add(next);
    setValue("file", dt.files, { shouldValidate: true });
    setOriginalFile(next);
  };

  const onSubmit = async (data: TicketFormData) => {
    if (isOptimizing) {
      toast.error("Esperá a que la imagen termine de procesarse.");
      return;
    }
    try {
      // Si la optimización produjo un archivo, lo usamos. Si no, usamos el
      // original. Mantenemos intacto el campo `file` y el endpoint del backend.
      const finalFile = optimizedFile ?? originalFile ?? data.file?.[0];
      if (!finalFile) {
        toast.error("Debe adjuntar una imagen del problema.");
        return;
      }

      const dt = new DataTransfer();
      dt.items.add(finalFile);
      const payload: TicketFormData = {
        ...data,
        file: dt.files,
      };

      const result = await createTicket.mutateAsync(payload);
      toast.success(`Tu reporte fue enviado correctamente. Codigo: ${result.tracking_code}`);
      reset();
      resetImage();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onSuccess?.(result.tracking_code);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      const msg = axiosErr?.response?.data?.error ?? "Error al enviar el reporte. Intente nuevamente.";
      toast.error(msg);
    }
  };

  const labelClass = `block text-[11px] font-bold mb-1.5 ml-0.5 uppercase tracking-[0.13em] ${
    isDarkMode ? "text-white/40" : "text-gray-400"
  }`;

  const inputClass = `w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none ${
    isDarkMode
      ? "bg-[#1C1C1C] border-[#2A2A2A] text-white/90 placeholder:text-white/20 focus:border-blue-500 focus:bg-[#212121]"
      : "bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-blue-500"
  }`;

  const errClass = `${isDarkMode ? "text-red-400" : "text-red-500"} text-[11px] mt-1.5 font-medium`;

  const focusMotion = {
    whileFocus: {
      scale: 1.01,
      y: -2,
      boxShadow: isDarkMode
        ? "0 0 0 3px rgba(59,130,246,0.12), 0 8px 32px rgba(0,0,0,0.4)"
        : "0 8px 24px -4px rgba(59,130,246,0.15)",
      transition: { duration: 0.2, ease: "easeOut" as const },
    },
  };

  const isSubmittingForm = createTicket.isPending;
  const isSubmitDisabled = isSubmittingForm || isOptimizing;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" noValidate>

        {/* Banner Informativo */}
        <AnimatedSection>
          <div className={`border-l-4 border-blue-500 p-4 rounded-r-xl flex items-start gap-3.5 ${isDarkMode ? "bg-blue-950/30" : "bg-blue-50"}`}>
            <svg className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className={`font-bold text-[11px] uppercase tracking-widest mb-1 ${isDarkMode ? "text-blue-400" : "text-blue-800"}`}>
                Version Preliminar
              </h4>
              <p className={`text-sm leading-relaxed ${isDarkMode ? "text-blue-300/70" : "text-blue-700"}`}>
                En esta version preliminar solo se pueden reportar situaciones de{" "}
                <strong>camineria rural</strong>. Proximamente se habilitaran otros servicios.
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* SECCION 01: Destino */}
        <AnimatedSection className="space-y-4">
          <DividerSection num="01" title="Destino de la solicitud" isDarkMode={isDarkMode} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Organismo</label>
              <input type="hidden" {...register("municipality_or_destination")} />
              <motion.input {...focusMotion} readOnly value="Intendencia de Lavalleja" className={`${inputClass} cursor-not-allowed opacity-75`} />
              <AnimatePresence>
                {errors.municipality_or_destination && (
                  <motion.p variants={errorVariants} initial="hidden" animate="visible" exit="exit" className={errClass}>
                    {errors.municipality_or_destination.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <div>
              <label className={labelClass}>Categoría</label>
              <input type="hidden" {...register("category")} />
              <div className={`${inputClass} cursor-not-allowed opacity-75 flex items-center justify-between`}>
                <span>Caminería Rural</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${isDarkMode ? "bg-blue-950/60 text-blue-400" : "bg-blue-100 text-blue-700"}`}>
                  Beta
                </span>
              </div>
              <p className={`text-[11px] mt-1.5 ml-0.5 ${isDarkMode ? "text-white/25" : "text-gray-400"}`}>
                Única categoría disponible en esta versión.
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* SECCION 02: Datos de contacto */}
        <AnimatedSection className="space-y-4">
          <DividerSection num="02" title="Datos de contacto" isDarkMode={isDarkMode} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nombre completo</label>
              <motion.input {...focusMotion} type="text" {...register("full_name")} placeholder="Como figura en su cedula" className={inputClass} />
              <AnimatePresence>
                {errors.full_name && (
                  <motion.p variants={errorVariants} initial="hidden" animate="visible" exit="exit" className={errClass}>
                    {errors.full_name.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <div>
              <label className={labelClass}>Correo electronico</label>
              <motion.input {...focusMotion} type="email" {...register("email")} placeholder="ejemplo@correo.com" className={inputClass} />
              <AnimatePresence>
                {errors.email && (
                  <motion.p variants={errorVariants} initial="hidden" animate="visible" exit="exit" className={errClass}>
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </AnimatedSection>

        {/* SECCION 03: Descripcion del problema */}
        <AnimatedSection className="space-y-4">
          <DividerSection num="03" title="Descripcion del problema" isDarkMode={isDarkMode} />
          <motion.textarea
            {...focusMotion} {...register("description")} rows={5}
            placeholder="Describa la situacion con el mayor detalle posible..."
            className={`${inputClass} resize-none`}
          />
          <AnimatePresence>
            {errors.description && (
              <motion.p variants={errorVariants} initial="hidden" animate="visible" exit="exit" className={errClass}>
                {errors.description.message}
              </motion.p>
            )}
          </AnimatePresence>
        </AnimatedSection>

        {/* SECCION 04: Ubicacion */}
        <AnimatedSection className="space-y-4">
          <DividerSection num="04" title="Ubicacion del problema" isDarkMode={isDarkMode} />
          <Controller
            name="location"
            control={control}
            render={() => (
              <div className="space-y-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsMapOpen(true)}
                  className={`w-full py-3.5 px-4 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center gap-2.5 ${
                    hasLocation
                      ? isDarkMode
                        ? "border-green-600/60 bg-green-950/40 text-green-400"
                        : "border-green-500 bg-green-50 text-green-700"
                      : isDarkMode
                        ? "border-dashed border-[#333] bg-[#1A1A1A] text-white/35 hover:border-blue-500/50 hover:text-blue-400"
                        : "border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {hasLocation
                    ? `Ubicacion: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}  Cambiar`
                    : "Seleccionar Lugar del Problema"}
                </motion.button>
                <AnimatePresence>
                  {errors.location && (
                    <motion.p variants={errorVariants} initial="hidden" animate="visible" exit="exit" className={errClass}>
                      {(errors.location as { message?: string }).message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}
          />
        </AnimatedSection>

        {/* SECCION 05: Imagen */}
        <AnimatedSection className="space-y-4">
          <DividerSection num="05" title="Imagen del problema" isDarkMode={isDarkMode} />
          <div>
            <label className={labelClass}>Foto del problema <span className={isDarkMode ? "text-red-400" : "text-red-500"}>*</span></label>
            <motion.input
              {...focusMotion}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              ref={fileInputRefCallback}
              name={fileReg.name}
              onBlur={fileReg.onBlur}
              onChange={onFileChange}
              disabled={isOptimizing}
              aria-busy={isOptimizing}
              aria-describedby="image-help image-status"
              className={`w-full px-4 py-3 rounded-xl border-2 border-dashed transition-all outline-none cursor-pointer
                file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold disabled:opacity-60 disabled:cursor-wait ${
                isDarkMode
                  ? "border-[#2A2A2A] bg-[#1A1A1A] text-white/40 file:bg-blue-950/60 file:text-blue-400 hover:file:bg-blue-950/80 focus:border-blue-500"
                  : "border-gray-200 bg-gray-50 text-gray-500 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:border-blue-400"
              }`}
            />
            <p id="image-help" className={`text-[11px] mt-1.5 ml-0.5 ${isDarkMode ? "text-white/25" : "text-gray-400"}`}>
              JPG, PNG o WEBP. Maximo 30MB; la imagen se optimiza automaticamente antes de enviarla.
            </p>

            {/* Estado de la imagen seleccionada / optimización */}
            <div id="image-status" aria-live="polite" className="mt-2 space-y-1.5">
              <AnimatePresence>
                {originalFile && !isOptimizing && !imageOptimizationError && (
                  <motion.p
                    key="selected-name"
                    variants={errorVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`text-[11px] font-medium flex items-center gap-1.5 ${isDarkMode ? "text-white/45" : "text-gray-500"}`}
                  >
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="truncate max-w-[60ch]">{originalFile.name}</span>
                    <span className={`${isDarkMode ? "text-white/30" : "text-gray-400"}`}>· {formatBytes(originalFile.size, 1)}</span>
                  </motion.p>
                )}

                {isOptimizing && (
                  <motion.p
                    key="optimizing"
                    variants={errorVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`text-[11px] font-semibold flex items-center gap-2 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
                  >
                    <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    Optimizando imagen para reducir el tiempo de envio...
                  </motion.p>
                )}

                {imageOptimizationResult && !isOptimizing && (
                  <motion.p
                    key="result"
                    variants={errorVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`text-[11px] font-semibold flex items-center gap-1.5 ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}
                  >
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {statusMessage}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {(errors.file || imageOptimizationError) && (
                <motion.p
                  key="file-err"
                  variants={errorVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={errClass}
                  role="alert"
                >
                  {imageOptimizationError ?? (errors.file?.message as string)}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </AnimatedSection>

        {/* SECCION 06: Verificacion y envio */}
        <AnimatedSection className="space-y-5">
          <DividerSection num="06" title="Verificacion y envio" isDarkMode={isDarkMode} />
          <div className={`rounded-xl p-4 border ${isDarkMode ? "bg-[#181818] border-[#282828]" : "bg-gray-50 border-gray-200"}`}>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                {...register("acceptedDataPolicy")}
                className="mt-0.5 w-4 h-4 rounded focus:ring-blue-500 flex-shrink-0 accent-blue-600"
              />
              <span className={`text-sm leading-relaxed transition-colors ${isDarkMode ? "text-white/50 group-hover:text-white/70" : "text-gray-600 group-hover:text-gray-800"}`}>
                He leido y acepto la{" "}
                <strong className={isDarkMode ? "text-blue-400" : "text-blue-700"}>Politica de Privacidad</strong>{" "}
                de la Intendencia de Lavalleja y autorizo el tratamiento de mis datos personales con arreglo a la{" "}
                <a
                  href="https://www.impo.com.uy/bases/leyes/18331-2008"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`underline font-semibold ${isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"}`}
                >
                  Ley N&deg; 18.331
                </a>{" "}
                de Proteccion de Datos Personales y Accion de Habeas Data (Uruguay), a los efectos exclusivos de la gestion de este reporte ciudadano.
              </span>
            </label>
            <AnimatePresence>
              {errors.acceptedDataPolicy && (
                <motion.p variants={errorVariants} initial="hidden" animate="visible" exit="exit" className={`${errClass} mt-2`}>
                  {errors.acceptedDataPolicy.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Mensaje de progreso del envío */}
          <AnimatePresence>
            {isSubmittingForm && (
              <motion.p
                key="sending"
                variants={errorVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                role="status"
                className={`text-[12px] font-semibold flex items-center gap-2 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
              >
                <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                Enviando reporte...
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={!isSubmitDisabled ? { scale: 1.01 } : undefined}
            whileTap={!isSubmitDisabled ? { scale: 0.98 } : undefined}
            disabled={isSubmitDisabled}
            type="submit"
            aria-busy={isSubmitDisabled}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-base tracking-wide uppercase shadow-lg shadow-blue-900/20"
          >
            {isOptimizing
              ? "Procesando imagen..."
              : isSubmittingForm
                ? "Enviando..."
                : "Enviar Reporte"}
          </motion.button>
        </AnimatedSection>
      </form>

      <MapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        currentLocation={location ?? { lat: 0, lng: 0 }}
        onConfirm={(loc) => setValue("location", loc, { shouldValidate: true })}
      />
    </>
  );
};
