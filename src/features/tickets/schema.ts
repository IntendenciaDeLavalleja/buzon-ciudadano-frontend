import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const ticketSchema = z.object({
  municipality_or_destination: z.string().min(1, "El organismo es obligatorio"),
  category: z.enum(["camineria_rural"]),
  full_name: z.string().min(3, "El nombre completo es obligatorio"),
  email: z.string().email("Correo electronico invalido"),
  description: z.string().min(10, "La descripcion debe tener al menos 10 caracteres").max(5000, "Maximo 5000 caracteres"),
  location: locationSchema.refine(
    (loc) => loc.lat !== 0 || loc.lng !== 0,
    { message: "Debe seleccionar la ubicacion del problema en el mapa" }
  ),
  file: z
    .custom<FileList>()
    .refine((files) => files && files.length === 1, "Debe adjuntar una imagen del problema")
    .refine((files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE, "El archivo no debe superar los 5MB")
    .refine(
      (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0].type),
      "Solo se aceptan formatos .jpg, .png y .webp"
    ),
  acceptedDataPolicy: z.literal(true, {
    error: "Debe aceptar la politica de privacidad para continuar",
  }),
});

export type TicketFormData = z.infer<typeof ticketSchema>;
export type LocationData = z.infer<typeof locationSchema>;

export const CATEGORY_MAPPING: Record<string, string> = {
  "camineria_rural": "Camineria Rural"
};