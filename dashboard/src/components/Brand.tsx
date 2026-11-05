import { Layers3 } from "lucide-react";

export function Brand() {
  return (
    <>
      <Layers3 aria-hidden />
      <span className="brand-name">
        Claims<span className="brand-name-accent">Workbench</span>
      </span>
      <span className="demo-badge">Demo</span>
    </>
  );
}
