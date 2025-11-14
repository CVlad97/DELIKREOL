import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  className?: string;
  variant?: 'fixed' | 'inline' | 'icon';
  size?: 'small' | 'medium' | 'large';
}

export function WhatsAppButton({
  phoneNumber = '+596696000000',
  message = 'Bonjour, je souhaite passer une commande sur Delikreol !',
  className = '',
  variant = 'fixed',
  size = 'medium',
}: WhatsAppButtonProps) {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

  const handleClick = () => {
    window.open(whatsappUrl, '_blank');
  };

  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-14 h-14',
    large: 'w-16 h-16',
  };

  const iconSizes = {
    small: 20,
    medium: 24,
    large: 28,
  };

  if (variant === 'fixed') {
    return (
      <button
        onClick={handleClick}
        className={`fixed bottom-20 right-4 ${sizeClasses[size]} bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-all duration-300 hover:scale-110 animate-pulse ${className}`}
        title="Contactez-nous sur WhatsApp"
      >
        <MessageCircle size={iconSizes[size]} fill="white" />
      </button>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={`${sizeClasses[size]} bg-green-500 hover:bg-green-600 text-white rounded-full shadow-md flex items-center justify-center transition-all duration-300 hover:scale-105 ${className}`}
        title="WhatsApp"
      >
        <MessageCircle size={iconSizes[size]} fill="white" />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium shadow-md transition-all duration-300 hover:scale-105 ${className}`}
    >
      <MessageCircle size={20} fill="white" />
      <span>Commander sur WhatsApp</span>
    </button>
  );
}
