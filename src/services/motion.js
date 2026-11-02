// One set of curves and entrances for the whole site, so every surface moves
// with the same feel: things arrive on a long expo-out and leave quickly on
// an ease-in, never the same speed both ways.

export const EASE_OUT = [0.16, 1, 0.3, 1];
export const EASE_IN = [0.4, 0, 1, 1];

export const rise = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

export const stagger = (gap = 0.07, delay = 0) => ({
  hidden: {},
  shown: { transition: { staggerChildren: gap, delayChildren: delay } },
});

// A whole view swapping for another.
export const view = {
  exit: { opacity: 0, y: -12, transition: { duration: 0.2, ease: EASE_IN } },
};
