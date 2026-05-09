'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Calendar as CalendarIcon } from 'lucide-react';
import { TrackingField, DailyEntry, generateId, getTodayString } from '@/lib/store';
import AppModal from '@/components/ui/AppModal';
import AppInput from '@/components/ui/AppInput';
import AppTextarea from '@/components/ui/AppTextarea';
import AppButton from '@/components/ui/AppButton';

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
    <AppModal 
      isOpen={true} 
      onClose={onClose} 
      title={existingEntry ? 'Edit daily entry' : 'New daily entry'}
      description="Log your progress for the day to keep your tracking up to date."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <AppInput 
              label="Date" 
              type="date" 
              icon={CalendarIcon}
              error={errors['__date__']?.message}
              {...register('__date__', { required: 'Date is required' })}
            />
          </div>

           {fields.map((field) => (
             <div key={field.id} className="space-y-3">
                {field.type === 'number' ? (
                  <AppInput 
                    label={`${field.name}${field.unit ? ` (${field.unit})` : ''}`}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    error={errors[field.id]?.message}
                    {...register(field.id, {
                      validate: (v) => {
                        if (v === '' || v === undefined) return true;
                        const n = parseFloat(v);
                        if (isNaN(n)) return 'Invalid value';
                        if (n < 0) return 'Must be positive';
                        return true;
                      },
                    })}
                  />
                ) : (
                  <AppTextarea 
                    label={field.name}
                    placeholder={`Details for ${field.name.toLowerCase()}...`}
                    rows={3}
                    {...register(field.id)}
                  />
                )}
             </div>
           ))}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
           <AppButton variant="ghost" size="md" type="button" onClick={onClose}>Cancel</AppButton>
           <AppButton variant="primary" size="md" type="submit" isLoading={isSubmitting} icon={Save}>Save entry</AppButton>
        </div>
      </form>
    </AppModal>
  );
}
