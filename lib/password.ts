// A password must not contain the person's names or emails (easy to guess).
// Same rule as backend/src/common/password.ts (the server checks it again).

// "Jean-Éric" -> "jean-eric"
const plain = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

// The words a password may not contain: each name (3+ letters), each email"s
// part before the "@" and the words in it ("jean.mugisha90" -> "jean", "mugisha").
export function personalWords(name: string, emails: (string | null | undefined)[] = []) {
  const words = new Set<string>();
  const add = (w: string) => {
    if (w.length >= 3) words.add(w);
  };
  plain(name)
    .split(/[^a-z0-9]+/)
    .forEach(add);
  for (const email of emails) {
    const local = plain(email ?? "").split("@")[0].trim();
    add(local.replace(/[^a-z0-9]/g, ""));
    local.split(/[^a-z]+/).forEach(add);
  }
  return [...words];
}

// The error message, or null when the password is fine
export function passwordProblem(password: string, name: string, emails: (string | null | undefined)[] = []) {
  const text = plain(password).replace(/[^a-z0-9]/g, "");
  const found = personalWords(name, emails).find((w) => text.includes(w));
  return found ? `The password must not contain a name or email ("${found}")` : null;
}
