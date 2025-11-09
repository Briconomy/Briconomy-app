import { useLanguage } from '../contexts/LanguageContext.tsx';
import Modal from './Modal.tsx';

interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

function LanguageSelector({ isOpen, onClose }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (selectedLang: 'en' | 'zu') => {
    setLanguage(selectedLang);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.select_language')}>
      <div className="language-selector-content">
        <p className="language-prompt">{t('settings.language_prompt')}</p>
        
        <div className="language-options">
          <button
            type="button"
            className={`language-option ${language === 'en' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('en')}
          >
            <div className="language-option-content">
              <div className="language-name">English</div>
              {language === 'en' && (
                <div className="language-checkmark">✓</div>
              )}
            </div>
          </button>

          <button
            type="button"
            className={`language-option ${language === 'zu' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('zu')}
          >
            <div className="language-option-content">
              <div className="language-name">Zulu</div>
              {language === 'zu' && (
                <div className="language-checkmark">✓</div>
              )}
            </div>
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default LanguageSelector;
