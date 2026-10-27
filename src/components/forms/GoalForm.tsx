"use client";

import { FormEvent, useState, useTransition } from "react";
import { createGoal, deleteGoal, updateGoal } from "@/lib/actions";
import FormModal from "./FormModal";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
  toDateInput,
} from "./formUtils";

type ThemeOption = {
  id: string;
  title: string;
};

type GoalFormData = {
  id?: string;
  themeId: string;
  title: string;
  notes: string;
  deadline: Date | string | null;
  currentValue: number | null;
  targetValue: number | null;
  unit: string | null;
};

interface GoalFormProps {
  buttonLabel: string;
  themes: ThemeOption[];
  defaultThemeId?: string;
  initialGoal?: GoalFormData;
  buttonClassName?: string;
}

export default function GoalForm({
  buttonLabel,
  themes,
  defaultThemeId,
  initialGoal,
  buttonClassName,
}: GoalFormProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <FormModal
      buttonLabel={buttonLabel}
      title={initialGoal ? "Edit Goal" : "Add Goal"}
      buttonClassName={buttonClassName}
    >
      {(close) => (
        <GoalFormBody
          themes={themes}
          defaultThemeId={defaultThemeId}
          initialGoal={initialGoal}
          isPending={isPending}
          onSubmit={(data) => {
            startTransition(async () => {
              if (initialGoal?.id) {
                await updateGoal(initialGoal.id, data);
              } else {
                await createGoal(data);
              }
              close();
            });
          }}
          onDelete={
            initialGoal?.id
              ? () => {
                  if (
                    window.confirm(
                      "Delete this goal and all of its systems and logs?"
                    )
                  ) {
                    startTransition(async () => {
                      await deleteGoal(initialGoal.id!);
                      close();
                    });
                  }
                }
              : undefined
          }
          onCancel={close}
        />
      )}
    </FormModal>
  );
}

function GoalFormBody({
  themes,
  defaultThemeId,
  initialGoal,
  isPending,
  onSubmit,
  onDelete,
  onCancel,
}: {
  themes: ThemeOption[];
  defaultThemeId?: string;
  initialGoal?: GoalFormData;
  isPending: boolean;
  onSubmit: (data: {
    themeId: string;
    title: string;
    notes: string;
    deadline: string;
    currentValue: string;
    targetValue: string;
    unit: string;
  }) => void;
  onDelete?: () => void;
  onCancel: () => void;
}) {
  const [themeId, setThemeId] = useState(
    initialGoal?.themeId ?? defaultThemeId ?? themes[0]?.id ?? ""
  );
  const [title, setTitle] = useState(initialGoal?.title ?? "");
  const [notes, setNotes] = useState(initialGoal?.notes ?? "");
  const [deadline, setDeadline] = useState(toDateInput(initialGoal?.deadline));
  const [currentValue, setCurrentValue] = useState(
    initialGoal?.currentValue?.toString() ?? ""
  );
  const [targetValue, setTargetValue] = useState(
    initialGoal?.targetValue?.toString() ?? ""
  );
  const [unit, setUnit] = useState(initialGoal?.unit ?? "");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({ themeId, title, notes, deadline, currentValue, targetValue, unit });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Theme</label>
        <select
          value={themeId}
          onChange={(event) => setThemeId(event.target.value)}
          className={inputClass}
          required
        >
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Title</label>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className={labelClass}>Due Date</label>
        <input
          type="date"
          value={deadline}
          onChange={(event) => setDeadline(event.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Current</label>
          <input
            type="number"
            value={currentValue}
            onChange={(event) => setCurrentValue(event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Target</label>
          <input
            type="number"
            value={targetValue}
            onChange={(event) => setTargetValue(event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Unit</label>
          <input
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            className={inputClass}
            placeholder="$, VO2..."
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className={inputClass}
          rows={4}
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <div>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isPending}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Delete
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className={secondaryButtonClass}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className={primaryButtonClass}
          >
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}
