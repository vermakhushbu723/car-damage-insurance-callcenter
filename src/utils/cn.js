/** Tiny class-name joiner – keeps conditional Tailwind classes readable. */
export const cn = (...classes) => classes.filter(Boolean).join(' ');

export default cn;
