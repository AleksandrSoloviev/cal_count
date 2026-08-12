type Props = {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  step: string;
  min: number;
  max: number;
  hint: string;
};

const GoalInput = ({ label, unit, value, onChange, error, step, min, max, hint }: Props) => (
  <div>
    <label className="block text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">
      {label}
    </label>
    <div
      className={`flex items-center rounded-xl border bg-card px-4 py-3.5 transition-colors ${
        error ? "border-red-400" : "border-border focus-within:border-foreground/40"
      }`}
    >
      <input
        type="number"
        inputMode={step === "1" ? "numeric" : "decimal"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={hint}
        step={step}
        min={min}
        max={max}
        aria-invalid={Boolean(error)}
        className="flex-1 bg-transparent outline-none font-mono text-xl text-foreground placeholder:text-muted-foreground/40"
      />
      <span className="text-muted-foreground text-sm ml-2 flex-shrink-0">{unit}</span>
    </div>
    {error && <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>}
  </div>
);

export default GoalInput;
