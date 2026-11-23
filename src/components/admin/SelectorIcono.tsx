import React from "react";
import { NOMBRES_ICONOS, icono } from "@/lib/iconos";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/** Selector de ícono de la lista permitida, con vista previa. */
const SelectorIcono: React.FC<{ id: string; value: string; onChange: (v: string) => void; disabled?: boolean }> = ({
  id,
  value,
  onChange,
  disabled,
}) => {
  const Actual = icono(value);
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="Elige un ícono">
          <span className="flex items-center gap-2">
            <Actual className="h-4 w-4" /> {value}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {NOMBRES_ICONOS.map((nombre) => {
          const I = icono(nombre);
          return (
            <SelectItem key={nombre} value={nombre}>
              <span className="flex items-center gap-2">
                <I className="h-4 w-4" /> {nombre}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default SelectorIcono;
