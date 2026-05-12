'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { TrackingField, TargetConfig } from '@/lib/store';
import { Target, Trash2, Save } from 'lucide-react';
import Badge from '@/components/ui/Badge';

interface TargetFormValues {
  targetValue: string;
  type: 'daily' | 'weekly';
}

interface TargetFormProps {
  field: TrackingField;
  existingTarget: TargetConfig | null;
  onSave: (target: TargetConfig) => void;
  onDelete?: () => void;
}

export default function TargetForm({ field, existingTarget, onSave, onDelete }: TargetFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<TargetFormValues>({
    defaultValues: {
      targetValue: existingTarget ? String(existingTarget.targetValue) : '',
      type: existingTarget?.type ?? 'daily',
    },
  });

  const watchedType = watch('type');
  const watchedValue = watch('targetValue');

  const onSubmit = (data: TargetFormValues) => {
    const target: TargetConfig = {
      fieldId: field.id,
      targetValue: parseFloat(data.targetValue),
      type: data.type,
    };
    onSave(target);
  };

  return (
    <div className="card p-5 shadow-card">
      {/* Field header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${field.color}18` }}
        >
          <Target size={16} style={{ color: field.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
            {field.name}
          </p>
          {field.unit && (
            <Badge variant="neutral" className="mt-0.5">
              {field.unit}
            </Badge>
          )}
        </div>
        {existingTarget && <Badge variant="success">Active</Badge>}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Target value */}
        <div>
          <label className="label text-xs" htmlFor={`target-val-${field.id}`}>
            Target Value
          </label>
          <input
            id={`target-val-${field.id}`}
            type="number"
            step="0.01"
            min="0.01"
            className="input-field"
            placeholder={`e.g. 8 ${field.unit}`}
            {...register('targetValue', {
              required: 'Target value is required',
              validate: (v) => {
                const n = parseFloat(v);
                if (isNaN(n) || n <= 0) return 'Must be greater than 0';
                return true;
              },
            })}
          />
          {errors.targetValue && <p className="error-text">{errors.targetValue.message}</p>}
        </div>

        {/* Type selector */}
        <div>
          <label className="label text-xs">Target Period</label>
          <div className="flex gap-2">
            {(['daily', 'weekly'] as const).map((t) => (
              <label
                key={`period-${field.id}-${t}`}
                className="flex items-center gap-2 cursor-pointer flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-150"
                style={{
                  borderColor: watchedType === t ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: watchedType === t ? 'rgba(37,99,235,0.06)' : 'var(--card)',
                  color: watchedType === t ? 'var(--primary)' : 'var(--muted-foreground)',
                }}
              >
                <input type="radio" value={t} className="sr-only" {...register('type')} />
                <div
                  className="w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0"
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
                <span className="capitalize">{t}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Preview */}
        {watchedValue && parseFloat(watchedValue) > 0 && (
          <div className="rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: 'var(--muted)' }}>
            <span style={{ color: 'var(--muted-foreground)' }}>Goal: </span>
            <span className="font-semibold tabular-nums font-numbers" style={{ color: 'var(--foreground)' }}>
              {watchedValue} {field.unit}
            </span>
            <span style={{ color: 'var(--muted-foreground)' }}> per {watchedType}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 text-xs py-2">
            {isSubmitting ? (
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
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
            ) : (
              <>
                <Save size={12} />
                {existingTarget ? 'Update' : 'Set Target'}
              </>
            )}
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="btn-ghost p-2 text-xs"
              aria-label={`Remove target for ${field.name}`}
              title={`Remove target for ${field.name}`}
              style={{ color: 'var(--danger)' }}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
