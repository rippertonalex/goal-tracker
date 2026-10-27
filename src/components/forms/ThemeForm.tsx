"use client";

import { FormEvent, useState, useTransition } from "react";
import { createTheme, deleteTheme, updateTheme } from "@/lib/actions";
import FormModal from "./FormModal";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./formUtils";

type ThemeFormData = {
  id?: string;
  title: string;
  number: number;
  emoji: string;
  color: string;
  identity: string;
};

interface ThemeFormProps {
  buttonLabel: string;
  initialTheme?: ThemeFormData;
  nextNumber?: number;
  buttonClassName?: string;
}

const colors = ["emerald", "blue", "rose", "amber", "purple"];

export default function ThemeForm({
  buttonLabel,
  initialTheme,
  nextNumber = 1,
  buttonClassName,
}: ThemeFormProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <FormModal
      buttonLabel={buttonLabel}
      title={initialTheme ? "Edit Theme" : "Add Theme"}
      buttonClassName={buttonClassName}
    >
      {(close) => (
        <ThemeFormBody
          initialTheme={initialTheme}
          nextNumber={nextNumber}
          isPending={isPending}
          onSubmit={(data) => {
            startTransition(async () => {
              if (initialTheme?.id) {
                await updateTheme(initialTheme.id, data);
              } else {
                await createTheme(data);
              }
              close();
            });
          }}
          onDelete={
            initialTheme?.id
              ? () => {
                  if (
                    window.confirm(
                      "Delete this theme and all of its goals, systems, and logs?"
                    )
                  ) {
                    startTransition(async () => {
                      await deleteTheme(initialTheme.id!);
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

function ThemeFormBody({
  initialTheme,
  nextNumber,
  isPending,
  onSubmit,
  onDelete,
  onCancel,
}: {
  initialTheme?: ThemeFormData;
  nextNumber: number;
  isPending: boolean;
  onSubmit: (data: Omit<ThemeFormData, "id">) => void;
  onDelete?: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initialTheme?.title ?? "");
  const [number, setNumber] = useState(initialTheme?.number ?? nextNumber);
  const [emoji, setEmoji] = useState(initialTheme?.emoji ?? "🎯");
  const [color, setColor] = useState(initialTheme?.color ?? "emerald");
  const [identity, setIdentity] = useState(initialTheme?.identity ?? "");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({ title, number, emoji, color, identity });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-[1fr_80px] gap-3">
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
          <label className={labelClass}>Number</label>
          <input
            type="number"
            value={number}
            onChange={(event) => setNumber(Number(event.target.value))}
            className={inputClass}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-[90px_1fr] gap-3">
        <div>
          <label className={labelClass}>Emoji</label>
          <input
            value={emoji}
            onChange={(event) => setEmoji(event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Color</label>
          <select
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className={inputClass}
          >
            {colors.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Identity</label>
        <textarea
          value={identity}
          onChange={(event) => setIdentity(event.target.value)}
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
