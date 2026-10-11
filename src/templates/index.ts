import { aangan, aparajita, gulaal, ivory, jamuni, kajal, kandeel, marigold, mehfil, neel, patjhad, sona, swarna, tulsi, zari } from './layouts';
import type { Layout } from './types';

/** Register new templates here. The first one is the default. */
export const layouts: Layout[] = [
  zari, aangan, ivory, marigold, aparajita,
  swarna, gulaal, jamuni, mehfil, tulsi, neel, patjhad, kajal, sona, kandeel,
];

export const getLayout = (id: string): Layout => layouts.find((l) => l.id === id) ?? layouts[0];
