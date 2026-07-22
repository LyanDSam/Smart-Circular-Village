const { z } = require('zod');

const deviceIdRegex = /^SCV-(COMP|COLL)-\d{3,4}$/;
const rfidUidRegex = /^[A-FA-f0-9]{8,10}$/;

// Heartbeat Schema
const heartbeatSchema = z.object({
  deviceId: z
    .string()
    .min(5, 'deviceId minimal 5 karakter')
    .regex(deviceIdRegex, 'Format deviceId contoh: SCV-COMP-001 atau SCV-COLL-001'),
});

// Telemetry Payload Schema
const telemetrySchema = z.object({
  deviceId: z
    .string()
    .min(5, 'deviceId minimal 5 karakter')
    .regex(deviceIdRegex, 'Format deviceId contoh: SCV-COMP-001 atau SCV-COLL-001'),

  telemetry: z
    .record(z.any())
    .refine((val) => val && Object.keys(val).length > 0, {
      message: 'Telemetry payload tidak boleh kosong',
    }),
});

// Pending Transaction Schema (RFID + Load Cell Weight)
const pendingTransactionSchema = z.object({
  deviceId: z
    .string()
    .min(5, 'deviceId minimal 5 karakter')
    .regex(deviceIdRegex, 'Format deviceId contoh: SCV-COLL-001'),

  rfidUid: z
    .string()
    .transform((val) => val.replace(/\s+/g, '').toUpperCase())
    .pipe(z.string().regex(rfidUidRegex, 'RFID UID harus berupa 8-10 karakter hex tanpa spasi (contoh: 8A3F1C90)')),

  weightGram: z
    .number()
    .int('Berat harus angka bulat dalam gram (integer)')
    .nonnegative('Berat tidak boleh negatif'),
});

// Firmware Log Schema
const deviceLogSchema = z.object({
  deviceId: z
    .string()
    .min(5, 'deviceId minimal 5 karakter')
    .regex(deviceIdRegex, 'Format deviceId contoh: SCV-COMP-001'),

  level: z.enum(['info', 'warn', 'error']).default('info'),

  message: z.string().min(1, 'Pesan log wajib diisi'),

  details: z.record(z.any()).optional(),
});

module.exports = {
  heartbeatSchema,
  telemetrySchema,
  pendingTransactionSchema,
  deviceLogSchema,
};
