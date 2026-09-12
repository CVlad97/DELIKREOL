import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientHomePage } from '../ClientHomePage';
import { setPageMeta } from '../../services/seo';
import type { LocalProduct } from '../../data/mockCatalog';

export default function PremiumHomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    setPageMeta(
      'DeliKreol — repas créoles et traiteurs locaux en Martinique',
      'Commandez auprès des traiteurs locaux de Martinique, en retrait ou en livraison planifiée.',
    );
  }, []);

  const selectMode = (mode: 'customer' | 'pro', draftItems?: LocalProduct[]) => {
    if (draftItems?.length) {
      sessionStorage.setItem('delikreol_premium_draft', JSON.stringify(draftItems));
    }
    navigate(mode === 'pro' ? '/devis' : '/catalogue');
  };

  return (
    <ClientHomePage
      liteMode
      onSelectMode={selectMode}
      onShowGuide={() => navigate('/aide')}
      onOpenDemo={() => navigate('/catalogue')}
      onShowLegal={(page) => navigate(page === 'privacy' ? '/confidentialite' : page === 'legal' ? '/mentions-legales' : page === 'cgu' ? '/cgu' : '/cgv')}
    />
  );
}
