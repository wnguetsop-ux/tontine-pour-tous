"use client";

import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
};

export default function AppLink({ href, children }: Props) {
  return <Link href={href}>{children}</Link>;
}
