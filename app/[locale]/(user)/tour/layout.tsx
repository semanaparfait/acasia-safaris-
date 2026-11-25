// What Google and link previews read for /tour (the page itself renders in the browser)
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Seo.tours" });
  return pageMetadata({ locale, path: "/tour", title: t("title"), description: t("description") });
}

export default function Layout({ children }: Props) {
  return children;
}
