/**
 * pointService — Isolated Point Calculation & Category Configurations for SCV Waste Bank.
 *
 * Configurable point ratios:
 * - Organic (Organik): 1 point / 100 gram  (10 points / kg)
 * - Plastic (Plastik): 2 points / 100 gram (20 points / kg)
 * - Paper (Kertas/Kardus): 1 point / 100 gram (10 points / kg)
 * - Metal (Logam/Kaleng): 5 points / 100 gram (50 points / kg)
 * - Glass (Kaca): 2 points / 100 gram (20 points / kg)
 * - Other (Lain-lain): 0 points
 */

export const WASTE_CATEGORIES = [
  {
    key: 'Organic',
    label: 'Organik (Sisa Makanan, Daun)',
    ratio: 1, // points per 100 gram
    pointsPerKg: 10,
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  },
  {
    key: 'Plastic',
    label: 'Anorganik - Plastik (Botol, Gelas, Wadah)',
    ratio: 2,
    pointsPerKg: 20,
    color: 'blue',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  },
  {
    key: 'Paper',
    label: 'Anorganik - Kertas / Kardus / Koran',
    ratio: 1,
    pointsPerKg: 10,
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  },
  {
    key: 'Metal',
    label: 'Anorganik - Logam / Besi / Kaleng',
    ratio: 5,
    pointsPerKg: 50,
    color: 'purple',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
  },
  {
    key: 'Glass',
    label: 'Anorganik - Kaca / Botol Kaca',
    ratio: 2,
    pointsPerKg: 20,
    color: 'teal',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800',
  },
  {
    key: 'Other',
    label: 'Residu / Lain-lain',
    ratio: 0,
    pointsPerKg: 0,
    color: 'slate',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
];

export const pointService = {
  /**
   * Calculate earned points integer based on waste category and weight in grams.
   */
  calculatePoints(wasteType, weightGram = 0) {
    if (!weightGram || weightGram <= 0) return 0;

    const category = WASTE_CATEGORIES.find(
      (c) => c.key.toLowerCase() === (wasteType || '').toLowerCase()
    );

    const ratio = category ? category.ratio : 0;
    const points = Math.floor((weightGram / 100) * ratio);

    return points;
  },

  /**
   * Returns list of configured waste categories.
   */
  getWasteCategories() {
    return WASTE_CATEGORIES;
  },

  /**
   * Convert integer weight in grams to string formatted in Kg (e.g. 2350 -> "2.35 Kg").
   */
  formatWeightKg(weightGram = 0) {
    const kg = (weightGram / 1000).toFixed(2);
    return `${kg} Kg`;
  },
};
