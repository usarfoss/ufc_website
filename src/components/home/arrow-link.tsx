import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

/** A sticker button with an arrow in a disc. Links starting with http open in a new tab, anything else is an in-site link. */
export function ArrowLink({
  href,
  className,
  size = 15,
  children,
}: {
  href: string;
  className: string;
  size?: number;
  children: ReactNode;
}) {
  const inner = (
    <>
      {children}
      <span className="disc">
        <ArrowUpRight size={size} strokeWidth={2.6} />
      </span>
    </>
  );
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}
