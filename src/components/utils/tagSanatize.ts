export const tagSanatize = (slug: string) => {
  return slug?.replace(/[\r\n\t]/g, "").trim();
};
