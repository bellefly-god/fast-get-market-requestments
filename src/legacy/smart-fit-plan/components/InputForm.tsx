import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormData {
  height: string;
  weight: string;
  gender: string;
  time: string;
}

interface InputFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

const InputForm = ({ onSubmit, isLoading }: InputFormProps) => {
  const [form, setForm] = useState<FormData>({
    height: "",
    weight: "",
    gender: "",
    time: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const timeOptions = ["10", "20", "30"];

  return (
    <section className="px-6 pb-8 opacity-0 animate-fade-in-up-delay-1" id="form-section">
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto bg-card rounded-3xl p-8 shadow-card space-y-5"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Height (cm)</label>
          <input
            type="number"
            placeholder="175"
            value={form.height}
            onChange={(e) => setForm({ ...form, height: e.target.value })}
            className="w-full h-12 rounded-2xl border border-input bg-background px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Weight (kg)</label>
          <input
            type="number"
            placeholder="80"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
            className="w-full h-12 rounded-2xl border border-input bg-background px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Gender</label>
          <div className="grid grid-cols-2 gap-3">
            {["Male", "Female"].map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => setForm({ ...form, gender: g.toLowerCase() })}
                className={`h-12 rounded-2xl border text-sm font-medium transition-all ${
                  form.gender === g.toLowerCase()
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-input bg-background text-muted-foreground hover:border-primary/40"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Daily available time</label>
          <div className="grid grid-cols-3 gap-3">
            {timeOptions.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setForm({ ...form, time: t })}
                className={`h-12 rounded-2xl border text-sm font-medium transition-all ${
                  form.time === t
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-input bg-background text-muted-foreground hover:border-primary/40"
                }`}
              >
                {t} min
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          variant="hero"
          size="xl"
          className="w-full mt-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate My Plan 👉"
          )}
        </Button>
      </form>
    </section>
  );
};

export default InputForm;
