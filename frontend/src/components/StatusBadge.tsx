import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const norm = status?.toUpperCase().replace(/ /g, '_') || 'UNKNOWN';

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['APPROVED', 'COMPLETED', 'ACTIVE', 'VERIFIED'].includes(norm)) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['REJECTED', 'DISPUTED', 'LAPSED', 'FAILED'].includes(norm)) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (['UNDER_REVIEW', 'EMPLOYMENT_VERIFICATION', 'DOCUMENT_VERIFICATION'].includes(norm)) {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (['SUBMITTED', 'PENDING', 'GRACE_PERIOD'].includes(norm)) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {formatText(status)}
    </span>
  );
};

