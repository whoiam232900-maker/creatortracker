'use client';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { TrackingField, generateId, getFieldColor } from '@/lib/store';
import { Save, X } from 'lucide-react';

interface FieldFormValues {
  name: string;
  type: 'number' | 'text';
  unit: string;
  defaultValue: string;
}

interface FieldFormProps {
  existingField: TrackingField | null;
  fieldCount: number;
  onSave: (field: TrackingField) => void;
  onCancel: () => void;
}

const FIELD_COLORS = [
  '#2563EB',
  '#0EA5E9',
  '#16A34A',
  '#D97706',
  '#9333EA',
  '#DB2777',
  '#0891B2',
  '#65A30D',
];

export default function FieldForm({ existingField, fieldCount, onSave, onCancel }: FieldFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FieldFormValues>({
    defaultValues: {
      name: existingField?.name ?? '',
      type: existingField?.type ?? 'number',
      unit: existingField?.unit ?? '',
      defaultValue: existingField?.defaultValue ?? '',
    },
  });

  useEffect(() => {
    reset({
      name: existingField?.name ?? '',
      type: existingField?.type ?? 'number',
      unit: existingField?.unit ?? '',
      defaultValue: existingField?.defaultValue ?? '',
    });
  }, [existingField, reset]);

  const watchedType = watch('type');

  const onSubmit = (data: FieldFormValues) => {
    const field: TrackingField = {
      id: existingField?.id ?? generateId('field'),
      name: data.name.trim(),
      type: data.type,
      unit: data.unit.trim(),
      defaultValue: data.defaultValue.trim(),
      color: existingField?.color ?? getFieldColor(fieldCount),
    };
    onSave(field);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div>
        <label className="label" htmlFor="field-name">
          Field Name <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <input
          id="field-name"
          type="text"
          className="input-field"
          placeholder="e.g. Hours Worked, Revenue, Tasks"
          {...register('name', {
            required: 'Field name is required',
            maxLength: { value: 40, message: 'Max 40 characters' },
            validate: (v) => v.trim().length > 0 || 'Field name cannot be blank',
          })}
        />
        {errors.name && <p className="error-text">{errors.name.message}</p>}
        <p className="helper-text">Choose a clear, descriptive name for what you are tracking.</p>
      </div>

      {/* Type */}
      <div>
        <label className="label">
          Field Type <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <div className="flex gap-3">
          {(['number', 'text'] as const).map((t) => (
            <label
              key={`type-opt-${t}`}
              className="flex items-center gap-2 cursor-pointer flex-1 px-3 py-2.5 rounded-lg border transition-all duration-150"
              style={{
                borderColor: watchedType === t ? 'var(--primary)' : 'var(--border)',
                backgroundColor: watchedType === t ? 'rgba(37,99,235,0.06)' : 'var(--card)',
              }}
            >
              <input type="radio" value={t} className="sr-only" {...register('type')} />
              <div
                className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{
                  borderColor: watchedType === t ? 'var(--primary)' : 'var(--border)',
                }}
              >
                {watchedType === t && (
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--primary)' }}
                  />
                )}
              </div>
              <span
                className="text-sm font-medium capitalize"
                style={{
                  color: watchedType === t ? 'var(--primary)' : 'var(--foreground)',
                }}
              >
                {t}
              </span>
            </label>
          ))}
        </div>
        <p className="helper-text">
          {watchedType === 'number'
            ? 'Numeric fields support totals, averages, targets, and charts.'
            : 'Text fields store notes or qualitative observations.'}
        </p>
      </div>

      {/* Unit (number only) */}
      {watchedType === 'number' && (
        <div>
          <label className="label" htmlFor="field-unit">
            Unit Label
          </label>
          <input
            id="field-unit"
            type="text"
            className="input-field"
            placeholder="e.g. hrs, tasks, $, km"
            maxLength={12}
            {...register('unit', {
              maxLength: { value: 12, message: 'Max 12 characters' },
            })}
          />
          {errors.unit && <p className="error-text">{errors.unit.message}</p>}
          <p className="helper-text">Short label shown next to values (optional).</p>
        </div>
      )}

      {/* Default value */}
      <div>
        <label className="label" htmlFor="field-default">
          Default Value
        </label>
        <input
          id="field-default"
          type={watchedType === 'number' ? 'number' : 'text'}
          step={watchedType === 'number' ? '0.01' : undefined}
          className="input-field"
          placeholder={watchedType === 'number' ? '0' : 'Leave blank for empty'}
          {...register('defaultValue', {
            validate: (v) => {
              if (watchedType === 'number' && v !== '') {
                const n = parseFloat(v);
                if (isNaN(n)) return 'Must be a valid number';
              }
              return true;
            },
          })}
        />
        {errors.defaultValue && <p className="error-text">{errors.defaultValue.message}</p>}
        <p className="helper-text">Pre-filled value when creating a new entry.</p>
      </div>

      {/* Color preview */}
      {existingField && (
        <div className="flex items-center gap-2 pt-1">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: existingField.color }} />
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Field color: {existingField.color}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 min-h-[36px]">
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
              {existingField ? 'Update Field' : 'Create Field'}
            </>
          )}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          <X size={14} />
          Cancel
        </button>
      </div>
    </form>
  );
}
