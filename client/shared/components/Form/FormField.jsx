import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * FormField – standard labeled input with error display.
 */
export const FormField = forwardRef(function FormField(
  { label, id, error, touched, required, hint, startIcon: StartIcon, className = "", inputClassName = "", ...props },
  ref
) {
  const showError = error && touched;
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}{required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}
      <div className="relative">
        {StartIcon && (
          <StartIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        )}
        <Input
          ref={ref}
          id={id}
          {...props}
          className={`${StartIcon ? "pl-10" : ""} ${showError ? "border-destructive focus-visible:ring-destructive" : ""} ${inputClassName}`}
        />
      </div>
      {hint && !showError && <p className="text-xs text-muted-foreground">{hint}</p>}
      {showError && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
});

/**
 * FormSelect – labeled select field.
 */
export function FormSelect({ label, id, error, touched, required, options = [], value, onChange, placeholder = "Select…", className = "" }) {
  const showError = error && touched;
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}{required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className={showError ? "border-destructive" : ""}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showError && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/**
 * FormTextarea – labeled textarea.
 */
export function FormTextarea({ label, id, error, touched, required, rows = 4, className = "", ...props }) {
  const showError = error && touched;
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}{required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}
      <textarea
        id={id}
        rows={rows}
        {...props}
        className={`w-full border rounded-lg px-3 py-2 text-sm bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-colors
          ${showError ? "border-destructive focus:ring-destructive" : "border-input"}`}
      />
      {showError && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default FormField;
