import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const chains = [
  { id: "ethereum", name: "Ethereum", icon: "⟠" },
  { id: "base", name: "Base", icon: "🔵" },
  { id: "arbitrum", name: "Arbitrum", icon: "🔷" },
  { id: "polygon", name: "Polygon", icon: "🟣" },
  { id: "bnb", name: "BNB Chain", icon: "🟡" },
];

interface ChainSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function ChainSelector({ value, onValueChange }: ChainSelectorProps) {
  const selectedChain = chains.find((c) => c.id === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full bg-background">
        <SelectValue>
          {selectedChain && (
            <span className="flex items-center gap-2">
              <span>{selectedChain.icon}</span>
              <span>{selectedChain.name}</span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-popover">
        {chains.map((chain) => (
          <SelectItem key={chain.id} value={chain.id}>
            <span className="flex items-center gap-2">
              <span>{chain.icon}</span>
              <span>{chain.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
