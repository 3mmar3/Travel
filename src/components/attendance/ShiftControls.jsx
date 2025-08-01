import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Square, Coffee, Loader } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { format, intervalToDuration } from 'date-fns';
import CircularProgress from '@/components/attendance/CircularProgress';

const ShiftControls = ({ shiftState, timers, handleShiftAction, shiftCount, lastShiftDuration, isLoading }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { company } = useCompany();

  const formatSecondsToParts = (totalSeconds) => {
    if (totalSeconds < 0) totalSeconds = 0;
    const duration = intervalToDuration({ start: 0, end: Math.floor(totalSeconds) * 1000 });
    return {
      hours: String(duration.hours || 0).padStart(2, '0'),
      minutes: String(duration.minutes || 0).padStart(2, '0'),
      seconds: String(duration.seconds || 0).padStart(2, '0'),
    };
  };

  const shiftProgress = (timers.shift / ((company?.settings?.shiftSettings?.defaultShiftHours || 8) * 3600)) * 100;
  const shiftsPerDayLimit = company?.settings?.shiftSettings?.shiftsPerDay || 1;
  const canStartShift = shiftState.status === 'not_started' && shiftCount < shiftsPerDayLimit;

  const netTimeSeconds = timers.shift;
  const netTimeParts = formatSecondsToParts(netTimeSeconds);
  const breakTimeParts = formatSecondsToParts(timers.break);
  const lastShiftDurationParts = formatSecondsToParts(lastShiftDuration);
  const ActionButton = ({ onClick, children, variant, ...props }) => (
      <Button onClick={onClick} className="w-full h-12 text-lg" disabled={isLoading} variant={variant} {...props}>
          {isLoading ? <Loader className="h-5 w-5 animate-spin"/> : children}
      </Button>
  );

  const renderTimer = (parts, size = '3xl', unitSize = 'sm') => (
    <div className="font-mono" style={{ fontFamily: 'monospace' }}>
      <span className={`text-${size} font-light tracking-tighter text-foreground`}>{parts.hours}</span>
      <span className={`text-${unitSize} text-muted-foreground mx-0.5`}>H</span>
      <span className={`text-${size} font-light tracking-tighter text-foreground`}>{parts.minutes}</span>
      <span className={`text-${unitSize} text-muted-foreground mx-0.5`}>M</span>
      <span className={`text-${size} font-light tracking-tighter text-foreground`}>{parts.seconds}</span>
      <span className={`text-${unitSize} text-muted-foreground`}>S</span>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="lg:col-span-1">
      <Card className="h-full glass-effect" style={{ background: 'hsla(var(--primary) / 0.1)' }}>
        <CardHeader>
          <CardTitle>{t('shiftControls')}</CardTitle>
          <CardDescription>{user?.username}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col h-full justify-start space-y-4">
          <div className="flex justify-center items-center py-6">
            <CircularProgress percentage={shiftProgress} size={200} strokeWidth={10}>
              <div className="text-center">
                {renderTimer(netTimeParts, '4xl', 'md')}
                <span className="text-sm text-muted-foreground mt-2">{ shiftState.status === 'on_break' ? `${t('break')}: ${breakTimeParts.hours}:${breakTimeParts.minutes}:${breakTimeParts.seconds}` : t('netTime') }</span>
              </div>
            </CircularProgress>
          </div>
          
          <div className="pt-4 space-y-3">
            {shiftState.status === 'not_started' && (
              <ActionButton onClick={() => handleShiftAction('start')} disabled={isLoading || !canStartShift}>
                <Play className="h-5 w-5 mr-2" /> {t('startShift')}
              </ActionButton>
            )}
            
            {shiftState.status === 'active' && (
              <div className="flex gap-4">
                <ActionButton onClick={() => handleShiftAction('end')} variant="destructive">
                  <Square className="h-5 w-5 mr-2" /> {t('endShift')}
                </ActionButton>
                <ActionButton onClick={() => handleShiftAction('start_break')} className="bg-yellow-500 hover:bg-yellow-600">
                  <Coffee className="h-5 w-5 mr-2" /> {t('startBreak')}
                </ActionButton>
              </div>
            )}

            {shiftState.status === 'on_break' && (
              <ActionButton onClick={() => handleShiftAction('end_break')} className="bg-yellow-500 hover:bg-yellow-600">
                <Play className="h-5 w-5 mr-2" /> {t('endBreak')}
              </ActionButton>
            )}
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-accent rounded-lg text-center">
                <p className="text-sm text-muted-foreground">{t('startTime')}</p>
                <p className="font-semibold text-lg">{shiftState.startTime ? format(new Date(shiftState.startTime), 'p') : '--:--'}</p>
              </div>
              <div className="p-4 bg-accent rounded-lg text-center">
                <p className="text-sm text-muted-foreground">{t('endTime')}</p>
                <p className="font-semibold text-lg">{shiftState.endTime ? format(new Date(shiftState.endTime), 'p') : '--:--'}</p>
              </div>
            </div>
            
            {lastShiftDuration > 0 && (
                <div className="p-4 bg-blue-500/10 rounded-lg text-center">
                  <p className="text-sm text-blue-400">Last Shift Net Time</p>
                  {renderTimer(lastShiftDurationParts, 'xl')}
                </div>
            )}
            
            <div className="text-center text-sm text-muted-foreground">
                <p>{t('shiftsStartedToday', { count: shiftCount, limit: shiftsPerDayLimit })}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ShiftControls;