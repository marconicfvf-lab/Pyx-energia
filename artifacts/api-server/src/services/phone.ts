/**
 * Brazilian numbers arrive from spreadsheets and WhatsApp in every possible
 * shape ("(81) 9 9972-5151", "81999725151", "+55 81 99972-5151"). Everything is
 * normalized to E.164 without the "+" so it can be used as a stable key and as
 * the WhatsApp provider recipient.
 */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "").replace(/^0+/, "");
  if (!digits) return null;

  let national = digits.startsWith("55") ? digits.slice(2) : digits;
  if (national.length === 12 && national.startsWith("55")) national = national.slice(2);
  if (national.length < 10 || national.length > 11) return null;

  const ddd = national.slice(0, 2);
  let subscriber = national.slice(2);
  // Mobile numbers are 9 digits; old 8-digit records get the ninth digit back.
  if (subscriber.length === 8 && Number(subscriber[0]) >= 6) subscriber = `9${subscriber}`;
  if (Number(ddd) < 11) return null;

  return `55${ddd}${subscriber}`;
}

const PHONE_IN_TEXT = /(?:\+?55\s?)?\(?\d{2}\)?[\s.-]?9?\d{4}[\s.-]?\d{4}/g;

/** Finds a phone number inside free-form chat text, ignoring money amounts. */
export function extractPhone(text: string): string | null {
  const candidates = text.match(PHONE_IN_TEXT);
  for (const candidate of candidates ?? []) {
    const normalized = normalizePhone(candidate);
    if (normalized) return normalized;
  }
  return null;
}

/** Removes phone numbers from a sentence so they are not read as amounts. */
export function stripPhones(text: string): string {
  return text.replace(PHONE_IN_TEXT, " ");
}

export function formatPhone(e164: string): string {
  const national = e164.startsWith("55") ? e164.slice(2) : e164;
  if (national.length < 10) return e164;
  return `(${national.slice(0, 2)}) ${national.slice(2, -4)}-${national.slice(-4)}`;
}
