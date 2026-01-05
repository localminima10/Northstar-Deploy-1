'use client';

import { useState, useEffect } from 'react';
import { WizardShell } from '../wizard-shell';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { TIMEZONE_OPTIONS, detectTimezone } from '@/lib/utils/timezone';
import { Json } from '@/lib/types/database';

const WEEKDAYS = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

interface CadenceStepProps {
  stepId: string;
  initialData: Json;
}

export function CadenceStep({ stepId, initialData }: CadenceStepProps) {
  const data = initialData as Record<string, unknown>;
  
  const [timezone, setTimezone] = useState<string>((data.timezone as string) || '');
  const [dailyCheckinTime, setDailyCheckinTime] = useState<string>((data.daily_checkin_time as string) || '08:00');
  const [weeklyReviewDay, setWeeklyReviewDay] = useState<string>(String((data.weekly_review_day as number) ?? 0));
  const [weeklyReviewTime, setWeeklyReviewTime] = useState<string>((data.weekly_review_time as string) || '10:00');
  const [monthlyResetDay, setMonthlyResetDay] = useState<number>((data.monthly_reset_day as number) || 1);
  const [notifications, setNotifications] = useState<string[]>((data.notifications as string[]) || []);

  // Detect timezone on mount
  useEffect(() => {
    if (!timezone) {
      const detected = detectTimezone();
      setTimezone(detected);
    }
  }, [timezone]);

  const toggleNotification = (type: string) => {
    if (notifications.includes(type)) {
      setNotifications(notifications.filter(n => n !== type));
    } else {
      setNotifications([...notifications, type]);
    }
  };

  const formData = {
    timezone,
    daily_checkin_time: dailyCheckinTime,
    weekly_review_day: parseInt(weeklyReviewDay),
    weekly_review_time: weeklyReviewTime,
    monthly_reset_day: monthlyResetDay,
    notifications,
  };

  const canProceed = timezone.length > 0;

  return (
    <WizardShell
      stepId={stepId}
      initialData={initialData}
      formData={formData}
      canProceed={canProceed}
      skipable={false}
    >
      <div className="space-y-8">
        {/* Timezone */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            What timezone should we use for &quot;today&quot; and reviews?
          </Label>
          <p className="text-sm text-muted-foreground">
            This ensures your daily check-ins and weekly reviews align with your local time.
          </p>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONE_OPTIONS.map(tz => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Daily Check-in Time */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            Daily check-in time
          </Label>
          <p className="text-sm text-muted-foreground">
            When would you like to be reminded to set your daily focus?
          </p>
          <Input
            type="time"
            value={dailyCheckinTime}
            onChange={(e) => setDailyCheckinTime(e.target.value)}
            className="w-32"
          />
        </div>

        {/* Weekly Review */}
        <div className="space-y-4">
          <Label className="text-base font-medium">
            Weekly review schedule
          </Label>
          <p className="text-sm text-muted-foreground">
            When do you want to do your weekly review?
          </p>
          
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Day</Label>
              <Select value={weeklyReviewDay} onValueChange={setWeeklyReviewDay}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAYS.map(day => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Time</Label>
              <Input
                type="time"
                value={weeklyReviewTime}
                onChange={(e) => setWeeklyReviewTime(e.target.value)}
                className="w-32"
              />
            </div>
          </div>
        </div>

        {/* Monthly Reset */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            Monthly reset day
          </Label>
          <p className="text-sm text-muted-foreground">
            Day of month for monthly reflection (1-28).
          </p>
          <Input
            type="number"
            value={monthlyResetDay}
            onChange={(e) => setMonthlyResetDay(Math.min(28, Math.max(1, parseInt(e.target.value) || 1)))}
            min={1}
            max={28}
            className="w-20"
          />
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">
              Enable reminders?
            </Label>
            <p className="text-sm text-muted-foreground">
              Note: Browser notification support varies. These set your preferences for future use.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="daily_checkin"
                checked={notifications.includes('daily_checkin')}
                onCheckedChange={() => toggleNotification('daily_checkin')}
              />
              <Label htmlFor="daily_checkin" className="cursor-pointer">
                Daily check-in reminder
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <Checkbox
                id="weekly_review"
                checked={notifications.includes('weekly_review')}
                onCheckedChange={() => toggleNotification('weekly_review')}
              />
              <Label htmlFor="weekly_review" className="cursor-pointer">
                Weekly review reminder
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <Checkbox
                id="monthly_reset"
                checked={notifications.includes('monthly_reset')}
                onCheckedChange={() => toggleNotification('monthly_reset')}
              />
              <Label htmlFor="monthly_reset" className="cursor-pointer">
                Monthly reset reminder
              </Label>
            </div>
          </div>
        </div>
      </div>
    </WizardShell>
  );
}

