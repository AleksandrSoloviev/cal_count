import { useState, type ReactNode } from "react";
import { ChevronLeft, UtensilsCrossed } from "lucide-react";
import { calculateGoalsFromSurvey } from "../domain/mifflin";
import type {
  ActivityLevel,
  GoalType,
  Goals,
  SurveySex,
} from "../domain/types";
import {
  type FieldErrors,
  type SurveyBodyErrors,
  validateGoals,
  validateSurveyBody,
} from "../domain/validation";
import en from "../i18n/en";
import GoalInput from "../components/GoalInput";

type Props = { onComplete: (g: Goals) => void };

type Step = "path" | "know" | "sex" | "body" | "goal" | "review";

type GoalDraft = { calories: string; protein: string; fat: string; carbs: string };

const emptyGoals = (): GoalDraft => ({
  calories: "",
  protein: "",
  fat: "",
  carbs: "",
});

const goalsToDraft = (g: Goals): GoalDraft => ({
  calories: String(g.calories),
  protein: String(g.protein),
  fat: String(g.fat),
  carbs: String(g.carbs),
});

const optionBtnClass = (selected: boolean) =>
  `w-full rounded-xl border px-4 py-3.5 text-center text-sm font-medium min-h-11 transition-colors active:scale-[0.99] ${
    selected
      ? "border-foreground/40 bg-card text-foreground"
      : "border-border bg-card text-foreground hover:border-foreground/30"
  }`;

const OnboardingScreen = ({ onComplete }: Props) => {
  const [step, setStep] = useState<Step>("path");
  const [sex, setSex] = useState<SurveySex | null>(null);
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [ageYears, setAgeYears] = useState("");
  const [activity, setActivity] = useState<ActivityLevel | null>(null);
  const [goalType, setGoalType] = useState<GoalType | null>(null);
  const [bodyErrors, setBodyErrors] = useState<SurveyBodyErrors>({});
  const [vals, setVals] = useState<GoalDraft>(emptyGoals);
  const [errors, setErrors] = useState<FieldErrors>({});

  const setGoalField = (k: keyof GoalDraft) => (v: string) => {
    setVals((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const handleClearSurvey = () => {
    setSex(null);
    setHeightCm("");
    setWeightKg("");
    setAgeYears("");
    setActivity(null);
    setGoalType(null);
    setBodyErrors({});
    setVals(emptyGoals());
    setErrors({});
  };

  const handleChooseKnow = () => {
    setVals(emptyGoals());
    setErrors({});
    setStep("know");
  };

  const handleChooseDontKnow = () => {
    handleClearSurvey();
    setStep("sex");
  };

  const handleBackToPath = () => {
    handleClearSurvey();
    setStep("path");
  };

  const handleSubmitGoals = () => {
    const result = validateGoals(vals);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    onComplete(result.goals);
  };

  const handlePickSex = (value: SurveySex) => {
    setSex(value);
    setStep("body");
  };

  const handleNextBody = () => {
    const result = validateSurveyBody({ heightCm, weightKg, ageYears, activity });
    if (!result.ok) {
      setBodyErrors(result.errors);
      return;
    }
    setBodyErrors({});
    setStep("goal");
  };

  const handlePickGoal = (value: GoalType) => {
    if (!sex || !activity) return;
    const body = validateSurveyBody({ heightCm, weightKg, ageYears, activity });
    if (!body.ok) {
      setBodyErrors(body.errors);
      setStep("body");
      return;
    }
    setGoalType(value);
    const goals = calculateGoalsFromSurvey({
      sex,
      heightCm: body.heightCm,
      weightKg: body.weightKg,
      ageYears: body.ageYears,
      activity: body.activity,
      goalType: value,
    });
    setVals(goalsToDraft(goals));
    setErrors({});
    setStep("review");
  };

  const handleRedo = () => {
    handleClearSurvey();
    setStep("sex");
  };

  const allFilled =
    vals.calories && vals.protein !== "" && vals.fat !== "" && vals.carbs !== "";

  const renderBrand = (title: string, subtitle: string, onBack?: () => void) => (
    <div className="mb-8 text-center">
      <div className="relative flex items-center justify-center mb-6 h-11">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label={en.onboarding.backAria}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 w-11 h-11 inline-flex items-center justify-center rounded-xl text-foreground hover:bg-muted/60"
          >
            <ChevronLeft size={20} aria-hidden />
          </button>
        )}
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <UtensilsCrossed size={18} className="text-primary-foreground" aria-hidden />
        </div>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2 leading-tight">
        {title}
      </h1>
      <p className="text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
    </div>
  );

  const renderGoalsForm = (opts: {
    title: string;
    subtitle: string;
    primaryLabel: string;
    onPrimary: () => void;
    secondary?: { label: string; onClick: () => void };
    onBack: () => void;
  }) => (
    <>
      {renderBrand(opts.title, opts.subtitle, opts.onBack)}
      <div className="space-y-4">
        <GoalInput
          label={en.goals.calories}
          unit={en.goals.unitKcal}
          value={vals.calories}
          onChange={setGoalField("calories")}
          error={errors.calories}
          step="1"
          min={500}
          max={10000}
          hint="e.g. 2000"
        />
        <GoalInput
          label={en.goals.protein}
          unit={en.goals.unitG}
          value={vals.protein}
          onChange={setGoalField("protein")}
          error={errors.protein}
          step="0.1"
          min={0}
          max={1000}
          hint="e.g. 150"
        />
        <GoalInput
          label={en.goals.fat}
          unit={en.goals.unitG}
          value={vals.fat}
          onChange={setGoalField("fat")}
          error={errors.fat}
          step="0.1"
          min={0}
          max={1000}
          hint="e.g. 65"
        />
        <GoalInput
          label={en.goals.carbs}
          unit={en.goals.unitG}
          value={vals.carbs}
          onChange={setGoalField("carbs")}
          error={errors.carbs}
          step="0.1"
          min={0}
          max={1000}
          hint="e.g. 250"
        />
      </div>
      <button
        type="button"
        onClick={opts.onPrimary}
        disabled={!allFilled}
        className="mt-8 w-full bg-primary text-primary-foreground rounded-xl py-4 text-sm font-semibold tracking-wide disabled:opacity-25 active:scale-[0.98] min-h-11"
      >
        {opts.primaryLabel}
      </button>
      {opts.secondary && (
        <button
          type="button"
          onClick={opts.secondary.onClick}
          className="mt-3 w-full rounded-xl border border-border py-3.5 text-sm font-medium text-foreground min-h-11 active:scale-[0.98]"
        >
          {opts.secondary.label}
        </button>
      )}
    </>
  );

  let body: ReactNode = null;

  if (step === "path") {
    body = (
      <>
        {renderBrand(en.onboarding.pathTitle, en.onboarding.pathSubtitle)}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleChooseKnow}
            className="w-full bg-primary text-primary-foreground rounded-xl py-4 text-sm font-semibold tracking-wide active:scale-[0.98] min-h-11"
          >
            {en.onboarding.knowCta}
          </button>
          <button
            type="button"
            onClick={handleChooseDontKnow}
            className="w-full rounded-xl border border-border bg-card py-4 text-sm font-semibold text-foreground active:scale-[0.98] min-h-11"
          >
            {en.onboarding.dontKnowCta}
          </button>
        </div>
      </>
    );
  } else if (step === "know") {
    body = renderGoalsForm({
      title: en.onboarding.title,
      subtitle: en.onboarding.subtitle,
      primaryLabel: en.onboarding.cta,
      onPrimary: handleSubmitGoals,
      onBack: handleBackToPath,
    });
  } else if (step === "sex") {
    body = (
      <>
        {renderBrand(en.onboarding.sexTitle, en.onboarding.sexSubtitle, handleBackToPath)}
        <div className="space-y-3" role="group" aria-label={en.onboarding.sexTitle}>
          {(
            [
              ["man", en.onboarding.sexMan],
              ["woman", en.onboarding.sexWoman],
              ["preferNotToSay", en.onboarding.sexPreferNot],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => handlePickSex(value)}
              className={optionBtnClass(sex === value)}
            >
              {label}
            </button>
          ))}
        </div>
      </>
    );
  } else if (step === "body") {
    body = (
      <>
        {renderBrand(en.onboarding.bodyTitle, en.onboarding.bodySubtitle, () => setStep("sex"))}
        <div className="space-y-4">
          <GoalInput
            label={en.onboarding.height}
            unit={en.onboarding.unitCm}
            value={heightCm}
            onChange={(v) => {
              setHeightCm(v);
              setBodyErrors((e) => ({ ...e, heightCm: undefined }));
            }}
            error={bodyErrors.heightCm}
            step="1"
            min={100}
            max={250}
            hint="e.g. 175"
          />
          <GoalInput
            label={en.onboarding.weight}
            unit={en.onboarding.unitKg}
            value={weightKg}
            onChange={(v) => {
              setWeightKg(v);
              setBodyErrors((e) => ({ ...e, weightKg: undefined }));
            }}
            error={bodyErrors.weightKg}
            step="0.1"
            min={30}
            max={300}
            hint="e.g. 70"
          />
          <GoalInput
            label={en.onboarding.age}
            unit={en.onboarding.unitYears}
            value={ageYears}
            onChange={(v) => {
              setAgeYears(v);
              setBodyErrors((e) => ({ ...e, ageYears: undefined }));
            }}
            error={bodyErrors.ageYears}
            step="1"
            min={14}
            max={100}
            hint="e.g. 30"
          />
          <div>
            <p className="block text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">
              {en.onboarding.activityLabel}
            </p>
            <div className="space-y-2" role="group" aria-label={en.onboarding.activityLabel}>
              {(
                [
                  ["low", en.onboarding.activityLow],
                  ["medium", en.onboarding.activityMedium],
                  ["high", en.onboarding.activityHigh],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setActivity(value);
                    setBodyErrors((e) => ({ ...e, activity: undefined }));
                  }}
                  className={optionBtnClass(activity === value)}
                  aria-pressed={activity === value}
                >
                  {label}
                </button>
              ))}
            </div>
            {bodyErrors.activity && (
              <p className="text-red-500 text-xs mt-1.5 font-medium">{bodyErrors.activity}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleNextBody}
          className="mt-8 w-full bg-primary text-primary-foreground rounded-xl py-4 text-sm font-semibold tracking-wide active:scale-[0.98] min-h-11"
        >
          {en.onboarding.next}
        </button>
      </>
    );
  } else if (step === "goal") {
    body = (
      <>
        {renderBrand(en.onboarding.goalTitle, en.onboarding.goalSubtitle, () => setStep("body"))}
        <div className="space-y-3" role="group" aria-label={en.onboarding.goalTitle}>
          {(
            [
              ["lose", en.onboarding.goalLose],
              ["maintain", en.onboarding.goalMaintain],
              ["gain", en.onboarding.goalGain],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => handlePickGoal(value)}
              className={optionBtnClass(goalType === value)}
            >
              {label}
            </button>
          ))}
        </div>
      </>
    );
  } else if (step === "review") {
    body = renderGoalsForm({
      title: en.onboarding.reviewTitle,
      subtitle: en.onboarding.reviewSubtitle,
      primaryLabel: en.onboarding.accept,
      onPrimary: handleSubmitGoals,
      secondary: { label: en.onboarding.redo, onClick: handleRedo },
      onBack: () => setStep("goal"),
    });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-16 max-w-sm mx-auto w-full">
        {body}
      </div>
    </div>
  );
};

export default OnboardingScreen;
