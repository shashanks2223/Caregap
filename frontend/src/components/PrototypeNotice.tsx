import React, { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export const PrototypeNotice: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
      <div className="flex items-center space-x-2 max-w-6xl mx-auto">
        <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>
          <strong>Academic Insurtech Prototype:</strong> CareGap AI explores income protection models for caregivers. All policy terms, premiums (e.g. ₹199/₹349/₹499), and claim payouts are illustrative demonstration values and do not constitute actual legal insurance contracts under Indian regulatory law.
        </span>
      </div>
      <button 
        onClick={() => setDismissed(true)} 
        className="text-amber-700 hover:text-amber-900 ml-4 p-1 rounded hover:bg-amber-100/50"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

