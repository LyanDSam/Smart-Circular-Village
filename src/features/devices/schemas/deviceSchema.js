import { z } from 'zod';

export const deviceSchema = z.object({
  deviceId: z
    .string()
    .min(5, 'Device ID minimal 5 karakter')
    .max(30, 'Device ID maksimal 30 karakter')
    .regex(/^SCV-(COMP|COLL)-\d{3,4}$/, 'Format Device ID wajib SCV-COMP-001 (Compost) atau SCV-COLL-001 (Station)'),

  name: z
    .string()
    .min(3, 'Nama perangkat minimal 3 karakter')
    .max(60, 'Nama perangkat maksimal 60 karakter'),

  deviceType: z.enum(['compost', 'collection_station'], {
    errorMap: () => ({ message: 'Pilih tipe perangkat yang valid (Compost atau Collection Station)' }),
  }),

  firmwareVersion: z
    .string()
    .min(1, 'Versi firmware wajib diisi')
    .regex(/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/, 'Format firmware contoh: 1.0.0 atau 1.2.0-beta'),

  location: z.object({
    village: z.string().min(2, 'Nama desa / wilayah wajib diisi'),
    address: z.string().min(3, 'Alamat / pos lokasi wajib diisi'),
    latitude: z
      .union([z.number(), z.string().transform((val) => (val === '' ? null : Number(val))), z.null()])
      .optional(),
    longitude: z
      .union([z.number(), z.string().transform((val) => (val === '' ? null : Number(val))), z.null()])
      .optional(),
  }),

  isActive: z.boolean().default(true),
});
