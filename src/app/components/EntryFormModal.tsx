'use client';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save } from 'lucide-react';
import { TrackingField, DailyEntry, generateId, getTodayString } from '@/lib/store';

interface EntryFormModalProps {
  fields: TrackingField[];
  existingEntry: DailyEntry | null;
  existingEntryForDate: DailyEntry | null;
  onSave: (entry: DailyEntry) => void;
  onClose: () => void;
}

type FormValues = Record<string, string>;

export default function EntryFormModal({
  fields,
  existingEntry,
  existingEntryForDate,
  onSave,
  onClose,
}: EntryFormModalProps) {
  const baseEntry = existingEntry || existingEntryForDate;
  const today = getTodayString();

  const defaultValues: FormValues = {};
  fields.forEach((f) => {
    const existing = baseEntry?.values.find((v) => v.fieldId === f.id);
    defaultValues[f.id] = existing?.value ?? f.defaultValue;
  });
  defaultValues['__date__'] = baseEntry?.date ?? today;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ defaultValues });

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingEntry]);

  const onSubmit = (data: FormValues) => {
    const dateVal = data['__date__'] || today;
    const entry: DailyEntry = {
      id: baseEntry?.id || generateId('entry'),
      date: dateVal,
      values: fields.map((f) => ({
        fieldId: f.id,
        value: data[f.id] ?? f.defaultValue,
      })),
      createdAt: baseEntry?.createdAt || new Date().toISOString(),
    };
    onSave(entry);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in"
      style={{ 
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(var(--blur-intensity, 0px))',
      }}
      onClick={onClose}
    >
      <div
        className="card shadow-modal w-full max-w-lg scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
            {existingEntry ? 'Edit Entry' : 'Log Entry'}
          </h2>
          <button onClick={onClose} className="btn-ghost p-1.5" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-5 space-y-4">
            {/* Date */}
            <div>
              <label className="label" htmlFor="entry-date">
                Date
              </label>
              <input
                id="entry-date"
                type="date"
                className="input-field"
                {...register('__date__', { required: 'Date is required' })}
              />
              {errors['__date__'] && <p className="error-text">{errors['__date__']?.message}</p>}
            </div>

            {/* Dynamic fields */}
            {fields.map((field) => (
              <div key={`form-field-${field.id}`}>
                <label className="label" htmlFor={`field-${field.id}`}>
                  {field.name}
                  {field.unit && (
                    <span
                      className="ml-1 text-xs font-normal"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      ({field.unit})
                    </span>
                  )}
                </label>
                {field.type === 'number' ? (
                  <input
                    id={`field-${field.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    className="input-field"
                    placeholder={`Enter ${field.name.toLowerCase()}`}
                    {...register(field.id, {
                      validate: (v) => {
                        if (v === '' || v === undefined) return true;
                        const n = parseFloat(v);
                        if (isNaN(n)) return 'Must be a valid number';
                        if (n < 0) return 'Must be 0 or greater';
                        return true;
                      },
                    })}
                  />
                ) : (
                  <textarea
                    id={`field-${field.id}`}
                    rows={2}
                    className="input-field resize-none"
                    placeholder={`Enter ${field.name.toLowerCase()}`}
                    {...register(field.id)}
                  />
                )}
                {errors[field.id] && <p className="error-text">{errors[field.id]?.message}</p>}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-3 px-6 py-4 border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary min-w-[100px]">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                <>
                  <Save size={14} />
                  Save Entry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
