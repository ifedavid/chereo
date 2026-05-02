import type { Frequency } from "@/lib/types";
import { FREQUENCY_LABEL } from "@/lib/types";

const CLASS: Record<Frequency, string> = {
  daily: "chip chip-daily",
  weekly: "chip chip-weekly",
  monthly: "chip chip-monthly",
  quarterly: "chip chip-quarterly",
};

export default function FrequencyChip({ frequency }: { frequency: Frequency }) {
  return <span className={CLASS[frequency]}>{FREQUENCY_LABEL[frequency]}</span>;
}
