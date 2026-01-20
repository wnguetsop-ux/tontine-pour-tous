"use client";

import Link from "next/link";
import React from "react";

type Props = {
  to: string;
  children: React.ReactNode;
};

export default function NavigationGuard({ to, children }: Props) {
  return (
    <Link href={to} prefetch={false}>
      {children}
    </Link>
  );
}
