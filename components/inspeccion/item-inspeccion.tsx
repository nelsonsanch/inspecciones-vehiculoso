import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RespuestaInspeccion } from '@/lib/auth-types';

interface ItemInspeccionProps {
  id: string;
  label: string;
  value: RespuestaInspeccion;
  onChange: (value: RespuestaInspeccion) => void;
  critico?: boolean;
}

export function ItemInspeccion({ id, label, value, onChange, critico }: ItemInspeccionProps) {
  return (
    <div className="space-y-2 pb-3 border-b border-gray-100 last:border-0">
      <div className="flex justify-between items-center">
        <Label className="font-medium">
          {label}
          {critico && <span className="ml-2 text-xs text-red-600 font-bold">*Crítico</span>}
        </Label>
      </div>
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as RespuestaInspeccion)}
        className="flex gap-6"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="bueno" id={`${id}-bueno`} />
          <Label htmlFor={`${id}-bueno`} className="cursor-pointer font-normal">
            Bueno
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="malo" id={`${id}-malo`} />
          <Label htmlFor={`${id}-malo`} className="cursor-pointer font-normal">
            Malo
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no-aplica" id={`${id}-na`} />
          <Label htmlFor={`${id}-na`} className="cursor-pointer font-normal">
            No Aplica
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
