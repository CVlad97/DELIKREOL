/// <reference types="vite/client" />

declare const ZoneCard: any;

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (options: { client_id: string; callback: (response: { credential?: string }) => void; ux_mode?: 'popup' | 'redirect' }) => void;
        renderButton: (element: HTMLElement, options: { theme?: 'outline' | 'filled_blue' | 'filled_black'; size?: 'large' | 'medium' | 'small'; text?: 'signin_with' | 'signup_with' | 'continue_with'; shape?: 'rectangular' | 'pill'; width?: number }) => void;
      };
    };
  };
}
