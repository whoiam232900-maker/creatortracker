'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { TrackingField, TargetConfig, generateId } from '@/lib/store';
import { Target, Trash2, Save } from 'lucide-react';
import Badge from '@/components/ui/Badge';

interface TargetFormValues {
  targetValue: string;
  type: 'daily' | 'weekly';
}

interface TargetFormProps {
  field: TrackingField;
  initialType?: 'daily' | 'weekly';
  existingTarget: TargetConfig | null;
  onSave: (target: TargetConfig) => void;
  onDelete?: () => void;
}

export default function TargetForm({
  field,
  initialType,
  existingTarget,
  onSave,
  onDelete,
}: TargetFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<TargetFormValues>({
    defaultValues: {
      targetValue: existingTarget ? String(existingTarget.targetValue) : '',
      type: existingTarget?.type ?? initialType ?? 'daily',
    },
  });

  const watchedType = watch('type');
  const watchedValue = watch('targetValue');

  const onSubmit = (data: TargetFormValues) => {
    const target: TargetConfig = {
      id: existingTarget?.id || generateId('target'),
      fieldId: field.id,
      targetValue: parseFloat(data.targetValue),
      type: data.type,
    };
    onSave(target);
  };

  return (
    <div className="card p-5 shadow-card border-white/[0.03]">
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
          <div className="flex items-center gap-1.5 mt-0.5">
            {field.unit && (
              <Badge variant="neutral" className="px-1.5 py-0">
                {field.unit}
              </Badge>
            )}
            {initialType && (
              <Badge variant="info" className="capitalize px-1.5 py-0">
                {initialType}
              </Badge>
            )}
          </div>
        </div>
        {existingTarget && (
          <Badge variant="success" className="animate-pulse-subtle">
            Active
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Target value */}
        <div>
          <label className="label text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1.5 block" htmlFor={`target-val-${field.id}-${initialType}`}>
            Target Value
          </label>
          <div className="relative group">
            <input
              id={`target-val-${field.id}-${initialType}`}
              type="number"
              step="0.01"
              min="0.01"
              className="input-field pr-12 font-numbers"
              placeholder={`e.g. 8`}
              {...register('targetValue', {
                required: 'Target value is required',
                validate: (v) => {
                  const n = parseFloat(v);
                  if (isNaN(n) || n <= 0) return 'Must be greater than 0';
                  return true;
                },
              })}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/40 pointer-events-none group-focus-within:text-primary/50 transition-colors uppercase">
              {field.unit || 'units'}
            </div>
          </div>
          {errors.targetValue && <p className="error-text text-[10px] mt-1.5">{errors.targetValue.message}</p>}
        </div>

        {/* Type selector - Only show if not forced by parent */}
        {!initialType && (
          <div>
            <label className="label text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1.5 block">Target Period</label>
            <div className="flex gap-2">
              {(['daily', 'weekly'] as const).map((t) => (
                <label
                  key={`period-${field.id}-${t}`}
                  className="flex items-center gap-2 cursor-pointer flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-150"
                  style={{
                    borderColor: watchedType === t ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: watchedType === t ? 'var(--accent-glow)' : 'var(--card)',
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
        )}
        
        {/* If type is forced, we still need it in the form state for onSubmit */}
        {initialType && (
          <input type="hidden" value={initialType} {...register('type')} />
        )}

        {/* Preview */}
        {watchedValue && parseFloat(watchedValue) > 0 && (
          <div className="rounded-lg px-3 py-2.5 text-[11px] border border-white/[0.02]" style={{ backgroundColor: 'var(--muted)' }}>
            <span style={{ color: 'var(--muted-foreground)' }}>Operational Goal: </span>
            <span
              className="font-bold tabular-nums font-numbers"
              style={{ color: 'var(--foreground)' }}
            >
              {watchedValue} {field.unit}
            </span>
            <span style={{ color: 'var(--muted-foreground)' }}> every {watchedType}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button type="submit" disabled={isSubmitting || !isDirty && !!existingTarget} className="btn-primary flex-1 text-[11px] py-2.5 font-bold uppercase tracking-widest disabled:opacity-30">
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
                {existingTarget ? 'Update Goal' : 'Establish Goal'}
              </>
            )}
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="btn-ghost p-2.5 text-xs rounded-lg hover:bg-danger/5"
              aria-label={`Remove target for ${field.name}`}
              title={`Remove target for ${field.name}`}
              style={{ color: 'var(--danger)' }}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
