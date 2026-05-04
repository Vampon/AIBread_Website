"use client";

import { useEffect } from "react";
import type { StepText as StepTextType } from "@/lib/levels";
import { MiniMd } from "@/lib/mini-md";
import { Bubble } from "./Bubble";

export function StepText({
  step,
  onComplete,
  active,
}: {
  step: StepTextType;
  active: boolean;
  onComplete: () => void;
}) {
  useEffect(() => {
    if (active) onComplete();
  }, [active, onComplete]);

  return (
    <Bubble speaker={step.speaker ?? "tutor"} label={step.speaker === "user" ? "你说" : "面包君"}>
      <MiniMd text={step.markdown} />
    </Bubble>
  );
}
