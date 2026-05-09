'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { TrackingField, TargetConfig } from '@/lib/store';
import { Target, Trash2, Save } from 'lucide-react';
import AppBadge from '@/components/ui/AppBadge';
import AppButton from '@/components/ui/AppButton';

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
    <div className="bg-card border border-border/40 p-6 rounded-3xl shadow-card relative overflow-hidden">
      {/* Field header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10 border border-primary/20"
        >
          <Target size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate text-foreground">
            {field.name}
          </p>
          {field.unit && (
            <AppBadge variant="neutral" className="mt-1">
              {field.unit}
            </AppBadge>
          )}
        </div>
        {existingTarget && <AppBadge variant="success">Active</AppBadge>}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Target value */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground ml-1" htmlFor={`target-val-${field.id}`}>
            Target Value
          </label>
          <div className="relative group">
            <input
              id={`target-val-${field.id}`}
              type="number"
              step="0.01"
              min="0.01"
              className="w-full bg-input border border-border/40 text-sm rounded-xl py-2.5 px-4 outline-none transition-all focus:border-primary/40 focus:bg-input-focus focus:ring-4 focus:ring-primary/5 hover:border-border/60"
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
          </div>
          {errors.targetValue && <p className="text-[11px] text-danger font-medium ml-1">{errors.targetValue.message}</p>}
        </div>

        {/* Type selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground ml-1">Target Period</label>
          <div className="flex gap-2">
            {(['daily', 'weekly'] as const).map((t) => (
              <label
                key={`period-${field.id}-${t}`}
                className={`
                  flex items-center gap-2 cursor-pointer flex-1 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200
                  ${watchedType === t 
                    ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/5' 
                    : 'border-border/40 bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:border-border/60'}
                `}
              >
                <input type="radio" value={t} className="sr-only" {...register('type')} />
                <div
                  className={`w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    watchedType === t ? 'border-primary' : 'border-muted-foreground/30'
                  }`}
                >
                  {watchedType === t && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-in zoom-in duration-200" />
                  )}
                </div>
                <span className="capitalize">{t}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Preview */}
        {watchedValue && parseFloat(watchedValue) > 0 && (
          <div className="rounded-xl px-4 py-3 text-xs border border-border/20 bg-muted/10">
            <span className="text-muted-foreground">Goal: </span>
            <span className="font-bold tabular-nums text-foreground">
              {watchedValue} {field.unit}
            </span>
            <span className="text-muted-foreground"> per {watchedType}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <AppButton 
            type="submit" 
            isLoading={isSubmitting} 
            variant="primary" 
            size="sm" 
            fullWidth
            icon={Save}
          >
            {existingTarget ? 'Update' : 'Set Target'}
          </AppButton>
          
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-2.5 rounded-xl bg-danger/5 text-danger/60 hover:text-danger hover:bg-danger/10 transition-all border border-danger/10"
              aria-label={`Remove target for ${field.name}`}
              title={`Remove target for ${field.name}`}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
