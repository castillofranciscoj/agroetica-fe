// src/lib/chatSchemas.ts
import { z } from 'zod';

/* ---------- domain objects ---------- */
export const FarmSchema = z.object({
  __typename: z.literal('Farm'),
  id:         z.string().uuid(),
  name:       z.string(),
  location:   z.object({
    latitude:  z.number(),
    longitude: z.number(),
  }),
  lands: z
    .array(
      z.object({
        landAreaHectares: z.number().optional(),
      })
    )
    .default([]),
});

export const LandSchema = z.object({
  __typename: z.literal('Land'),
  id:              z.string().uuid(),
  name:            z.string(),
  landAreaHectares:z.number(),
});

export const PracticeSchema = z.object({
  __typename: z.literal('SustainablePractice'),
  id:          z.string().uuid(),
  name:        z.string(),
  description: z.string().optional(),
  category:    z.object({ name: z.string() }).optional(),
});

/* ---------- tool I/O ---------- */
export const SelectFarmResult     = z.array(FarmSchema);
export const SelectLandResult     = z.array(LandSchema);
export const ListPracticesResult  = z.array(PracticeSchema);

/* ---------- assistant turn ----------
   What the model must stream for every reply                       */
export const ChatTurnSchema = z.object({
  message: z.string().min(1),
  options: z.union([
    SelectFarmResult,
    SelectLandResult,
    ListPracticesResult,
    z.array(z.unknown()),      // allow empty or future lists
  ]),
});
