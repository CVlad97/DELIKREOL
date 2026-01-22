import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface TrustBadgeHACCPProps {
  className?: string;
  showTooltip?: boolean;
}

export function TrustBadgeHACCP({ className = '', showTooltip = true }: TrustBadgeHACCPProps) {
  const [showTooltipContent, setShowTooltipContent] = useState(false);

  const tooltipText = 'Ce partenaire garantit le respect strict des normes d\'hygiène et de sécurité alimentaire en vigueur.';

  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`}>
      <div
        className="relative"
        onMouseEnter={() => showTooltip && setShowTooltipContent(true)}
        onMouseLeave={() => showTooltip && setShowTooltipContent(false)}
        onClick={() => showTooltip && setShowTooltipContent(!showTooltipContent)}
      >
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full">
          <ShieldCheck size={16} className="flex-shrink-0" />
          <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
            Partenaires certifiés HACCP
          </span>
        </div>

        {/* Tooltip for accessibility */}
        {showTooltip && (
          <div
            role="tooltip"
            aria-label={tooltipText}
            className={`absolute z-50 left-0 top-full mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap shadow-lg pointer-events-none transition-opacity duration-200 ${
              showTooltipContent ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
          >
            {tooltipText}
            <div className="absolute bottom-full left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
          </div>
        )}
      </div>

      {/* Mobile-friendly title fallback */}
      <span title={tooltipText} className="sr-only">
        {tooltipText}
      </span>
    </div>
  );
}
