// Any address that does not exist under /fr/… or /sw/… shows the translated 404
import { notFound } from "next/navigation";

export default function CatchAll() {
  notFound();
}
