"use client";

import { FormEvent, useState, useTransition } from "react";
import { createSystem, deleteSystem, updateSystem } from "@/lib/actions";
import FormModal from "./FormModal";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
  toDateInput,
} from "./formUtils";

type GoalOption = {
  id: string;
  title: string;
};

type SystemFormData = {
  id?: string;
  goalId: string;
  description: string;
  frequency: string;
  targetCount: number;
  deadline: Date | string | null;
};

interface SystemFormProps {
  buttonLabel: string;
  goals: GoalOption[];
  defaultGoalId?: string;
  initialSystem?: SystemFormData;
  buttonClassName?: string;
}

const frequencyOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "one_time", label: "One-time" },
  { value: "as_needed", label: "As Needed" },
];

export default function SystemForm({
  buttonLabel,
  goals,
  defaultGoalId,
  initialSystem,
  buttonClassName,
}: SystemFormProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <FormModal
      buttonLabel={buttonLabel}
      title={initialSystem ? "Edit System" : "Add System"}
      buttonClassName={buttonClassName}
    >
      {(close) => (
        <SystemFormBody
          goals={goals}
          defaultGoalId={defaultGoalId}
          initialSystem={initialSystem}
          isPending={isPending}
          onSubmit={(data) => {
            startTransition(async () => {
              if (initialSystem?.id) {
                await updateSystem(initialSystem.id, data);
              } else {
                await createSystem(data);
              }
              close();
            });
          }}
          onDelete={
            initialSystem?.id
              ? () => {
                  if (
                    window.confirm(
                      "Delete this system and its completion history?"
                    )
                  ) {
                    startTransition(async () => {
                      await deleteSystem(initialSystem.id!, initialSystem.goalId);
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

function SystemFormBody({
  goals,
  defaultGoalId,
  initialSystem,
  isPending,
  onSubmit,
  onDelete,
  onCancel,
}: {
  goals: GoalOption[];
  defaultGoalId?: string;
  initialSystem?: SystemFormData;
  isPending: boolean;
  onSubmit: (data: {
    goalId: string;
    description: string;
    frequency: string;
    targetCount: number;
    deadline: string;
  }) => void;
  onDelete?: () => void;
  onCancel: () => void;
}) {
  const [goalId, setGoalId] = useState(
    initialSystem?.goalId ?? defaultGoalId ?? goals[0]?.id ?? ""
  );
  const [description, setDescription] = useState(
    initialSystem?.description ?? ""
  );
  const [frequency, setFrequency] = useState(
    initialSystem?.frequency ?? "daily"
  );
  const [targetCount, setTargetCount] = useState(
    initialSystem?.targetCount ?? 1
  );
  const [deadline, setDeadline] = useState(
    toDateInput(initialSystem?.deadline)
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({ goalId, description, frequency, targetCount, deadline });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Goal</label>
        <select
          value={goalId}
          onChange={(event) => setGoalId(event.target.value)}
          className={inputClass}
          required
        >
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={inputClass}
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Frequency</label>
          <select
            value={frequency}
            onChange={(event) => setFrequency(event.target.value)}
            className={inputClass}
          >
            {frequencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Target Count</label>
          <input
            type="number"
            min={1}
            value={targetCount}
            onChange={(event) => setTargetCount(Number(event.target.value))}
            className={inputClass}
          />
        </div>
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
