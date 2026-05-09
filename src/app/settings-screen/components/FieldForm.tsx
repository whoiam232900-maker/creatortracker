'use client';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { TrackingField, generateId, getPresetFieldColor } from '@/lib/store';
import { Save, X } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import AppSelect from '@/components/ui/AppSelect';

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
      color: existingField?.color ?? getPresetFieldColor(fieldCount),
    };
    onSave(field);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <AppInput 
        label="Field Name"
        placeholder="e.g. Hours Worked, Revenue, Tasks"
        error={errors.name?.message}
        helperText="Choose a clear, descriptive name for what you are tracking."
        {...register('name', {
          required: 'Field name is required',
          maxLength: { value: 40, message: 'Max 40 characters' },
          validate: (v) => v.trim().length > 0 || 'Field name cannot be blank',
        })}
      />

      {/* Type */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground ml-1">Field Type</label>
        <div className="flex gap-3">
          {(['number', 'text'] as const).map((t) => (
            <label
              key={`type-opt-${t}`}
              className={`
                flex items-center gap-2 cursor-pointer flex-1 px-4 py-2.5 rounded-xl border font-bold text-xs transition-all duration-200
                ${watchedType === t 
                  ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/5' 
                  : 'border-border/40 bg-muted/20 text-muted-foreground hover:bg-muted/40'}
              `}
            >
              <input type="radio" value={t} className="sr-only" {...register('type')} />
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
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
        <p className="text-[11px] text-muted-foreground/60 italic ml-1">
          {watchedType === 'number'
            ? 'Numeric fields support totals, averages, targets, and charts.'
            : 'Text fields store notes or qualitative observations.'}
        </p>
      </div>

      {/* Unit (number only) */}
      {watchedType === 'number' && (
        <AppInput 
          label="Unit Label"
          placeholder="e.g. hrs, tasks, $, km"
          error={errors.unit?.message}
          helperText="Short label shown next to values (optional)."
          {...register('unit', {
            maxLength: { value: 12, message: 'Max 12 characters' },
          })}
        />
      )}

      {/* Default value */}
      <AppInput 
        label="Default Value"
        type={watchedType === 'number' ? 'number' : 'text'}
        placeholder={watchedType === 'number' ? '0' : 'Leave blank for empty'}
        error={errors.defaultValue?.message}
        helperText="Pre-filled value when creating a new entry."
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

      {/* Color preview */}
      {existingField && (
        <div className="flex items-center gap-2 px-1">
          <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: existingField.color }} />
          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
            Identity Color: {existingField.color}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4">
        <AppButton 
          type="submit" 
          isLoading={isSubmitting} 
          variant="primary" 
          fullWidth
          icon={Save}
        >
          {existingField ? 'Update Configuration' : 'Initialize Field'}
        </AppButton>
        <AppButton type="button" onClick={onCancel} variant="ghost" icon={X}>
          Cancel
        </AppButton>
      </div>
    </form>
  );
}
