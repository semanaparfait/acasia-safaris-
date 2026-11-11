// Links and navigation that keep the visitor's language:
// <Link href="/tour"> goes to /fr/tour on the French site.
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
