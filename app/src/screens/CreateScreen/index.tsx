import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../AppContext';
import { computeLoad } from '../../tokens';
import { COLORS } from '../../colors';
import { Icon } from '../../components/primitives';
import { StepDots } from './StepDots';
import { StepTitle } from './StepTitle';
import { StepDetails } from './StepDetails';
import { StepRoles } from './StepRoles';
import { TOTAL_STEPS, DEFAULT_ASSIGN, whenToDate, toISODate, type WhenValue, type CategoryValue, type RoleAssign } from './constants';

export function CreateScreen() {
  const insets = useSafeAreaInsets();
  const { persona, setActiveTab, activeCircle, tasks, refreshPersona, showToast, currentMember } = useApp();

  const defaultId = currentMember?.id ?? persona.members[0].id;
  const myId = persona.members[0].id;

  const [step, setStep]         = useState(0);
  const [title, setTitle]       = useState('');
  const [when, setWhen]         = useState<WhenValue | null>(null);
  const [category, setCategory] = useState<CategoryValue | null>(null);
  const [weight, setWeight]     = useState<number | null>(null);
  const [assign, setAssign]     = useState<RoleAssign>(DEFAULT_ASSIGN(defaultId));
  const [autoBalance, setAutoBalance] = useState(true);
  const [saving, setSaving]     = useState(false);
  const autoAdvance = useRef(true);

  const load = computeLoad(persona);
  const lightest = [...persona.members].sort((a, b) => load[a.id].total - load[b.id].total)[0];
  const rolesOnMe = Object.values(assign).filter(id => id === myId).length;
  const effectiveWeight = weight ?? 2;

  const canContinue =
    step === 0 ? !!title.trim() :
    step === 1 ? when !== null && category !== null && weight !== null :
    true;

  const tryAutoAdvance = (w: WhenValue | null, c: CategoryValue | null, wt: number | null) => {
    if (autoAdvance.current && w && c && wt !== null) {
      setTimeout(() => { Keyboard.dismiss(); setStep(2); }, 380);
    }
  };

  const handlePickWhen = (v: WhenValue) => { autoAdvance.current = true; setWhen(v); tryAutoAdvance(v, category, weight); };
  const handlePickCategory = (v: CategoryValue) => { autoAdvance.current = true; setCategory(v); tryAutoAdvance(when, v, weight); };
  const handlePickWeight = (v: number) => { autoAdvance.current = true; setWeight(v); tryAutoAdvance(when, category, v); };

  const reset = () => {
    autoAdvance.current = true;
    setTitle(''); setWhen(null); setCategory(null); setWeight(null);
    setAssign(DEFAULT_ASSIGN(defaultId)); setAutoBalance(true); setSaving(false); setStep(0);
  };

  const handleCancel = () => { reset(); setActiveTab('dashboard'); };
  const handleSave = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await tasks.create({
        circle_id: activeCircle.id, title: title.trim(),
        due_date: toISODate(whenToDate(when!)), category,
        weight: effectiveWeight,
        planner_id: assign.planner, organizer_id: assign.organizer,
        reminder_id: assign.reminder, executor_id: assign.executor,
      });
      await refreshPersona();
      showToast('Task added');
      reset(); setActiveTab('dashboard');
    } catch (err) {
      console.error('create task:', err);
      showToast('Could not save task');
      setSaving(false);
    }
  };

  const goNext = () => { Keyboard.dismiss(); setStep(s => s + 1); };
  const goBack = () => { if (step === 2) autoAdvance.current = false; setStep(s => s - 1); };
  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <View className="flex-1 bg-canvas">
      <StepDots step={step} />

      <Animated.View key={step} entering={FadeIn.duration(200)} className="flex-1">
        {step === 0 && <StepTitle title={title} onChange={setTitle} onSubmit={goNext} />}
        {step === 1 && (
          <StepDetails
            when={when} category={category} weight={weight}
            onPickWhen={handlePickWhen} onPickCategory={handlePickCategory} onPickWeight={handlePickWeight}
          />
        )}
        {step === 2 && (
          <StepRoles
            assign={assign} onChangeAssign={(key, id) => setAssign(a => ({ ...a, [key]: id }))}
            members={persona.members} weight={effectiveWeight}
            rolesOnMe={rolesOnMe} lightestMember={lightest}
            autoBalance={autoBalance}
            onHandOff={() => setAssign(a => ({ ...a, executor: lightest.id }))}
            onDismissNudge={() => setAutoBalance(false)}
          />
        )}
      </Animated.View>

      <View className="flex-row justify-between px-5 pt-2" style={{ paddingBottom: insets.bottom + 100 }}>
        <TouchableOpacity
          onPress={step === 0 ? handleCancel : goBack}
          className="w-[54px] h-[54px] rounded-full bg-surface border-half border-line items-center justify-center"
          style={{ shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Icon name="back" size={20} color={COLORS.ink} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={isLastStep ? handleSave : goNext}
          disabled={!canContinue || saving}
          className="w-[54px] h-[54px] rounded-full items-center justify-center"
          style={{ backgroundColor: canContinue ? COLORS.ink : COLORS.line, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.75}
        >
          {saving
            ? <ActivityIndicator size="small" color={COLORS.surface} />
            : <Icon name={isLastStep ? 'check' : 'chev'} size={20} color={canContinue ? COLORS.surface : COLORS.muted} />
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}
