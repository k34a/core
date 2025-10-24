"use client";

import React from "react";
import { Button as MantineBtn } from "@mantine/core";

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <MantineBtn {...props} />;
}
