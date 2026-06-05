'use client';

import { Drawer } from '@/components/ui/Drawer';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ReadinessScoreRing } from '@/components/ui/ReadinessScoreRing';
import { computeReadinessScore } from '@/hooks/useReadinessScore';
import { DAYS_OF_WEEK, DAY_LABELS } from '@/lib/constants';
import type { Student, Availability, DayHours } from '@/types';

interface StudentProfileDrawerProps {
  student: Student | null;
  open: boolean;
  onClose: () => void;
}

export function StudentProfileDrawer({ student, open, onClose }: StudentProfileDrawerProps) {
  if (!student) return null;

  const completedContent: string[] = (student as any)?.work_ready_completed ?? [];
  const readiness = computeReadinessScore(student, completedContent);
  const name = `${student.first_name} ${student.last_name}`;

  return (
    <Drawer open={open} onClose={onClose} title="Applicant profile">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Avatar src={student.avatar_url} name={name} size="xl" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
            {student.school_or_college && <p className="text-sm text-text-secondary">{student.school_or_college}</p>}
            <div className="mt-2">
              <ReadinessScoreRing score={readiness.score} color={readiness.color} label={readiness.label} size={56} strokeWidth={5} />
            </div>
          </div>
        </div>

        {/* Bio */}
        {student.bio && (
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5">About</h3>
            <p className="text-sm text-gray-700">{student.bio}</p>
          </div>
        )}

        {/* Skills */}
        {student.skills?.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {student.skills.map((s) => <Badge key={s} variant="default">{s}</Badge>)}
            </div>
          </div>
        )}

        {/* Availability */}
        {student.availability && (
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5">Availability</h3>
            <div className="space-y-1">
              {DAYS_OF_WEEK.map((day) => {
                const dayData = student.availability[day as keyof Availability] as DayHours | null | undefined;
                if (!dayData) return null;
                return (
                  <div key={day} className="flex items-center gap-2 text-xs">
                    <span className="w-10 font-medium text-gray-700">{DAY_LABELS[day as keyof typeof DAY_LABELS]}</span>
                    <span className="text-text-secondary">{dayData.startTime} – {dayData.endTime}</span>
                  </div>
                );
              })}
              {Object.values(student.availability).every((v) => !v) && (
                <p className="text-xs text-text-secondary">No availability set</p>
              )}
            </div>
          </div>
        )}

        {/* CV */}
        {student.cv_url && (
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5">CV</h3>
            <a href={student.cv_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
              Download CV →
            </a>
          </div>
        )}

        {/* Intro video */}
        {student.intro_video_url && (
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5">Intro video</h3>
            <video src={student.intro_video_url} controls className="w-full rounded-lg max-h-48" />
          </div>
        )}
      </div>
    </Drawer>
  );
}
