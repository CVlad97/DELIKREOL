import { QRCodeSVG } from 'qrcode.react';

interface QRDisplayProps {
  value: string;
  size?: number;
  title?: string;
  description?: string;
}

export function QRDisplay({ value, size = 200, title, description }: QRDisplayProps) {
  return (
    <div className="flex flex-col items-center space-y-3">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <QRCodeSVG value={value} size={size} level="H" />
      </div>
      {description && <p className="text-sm text-gray-600 text-center">{description}</p>}
      <p className="text-xs text-gray-500 font-mono break-all text-center max-w-xs">
        {value}
      </p>
    </div>
  );
}
