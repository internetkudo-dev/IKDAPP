
import { useState, useEffect } from 'react';
import i18n from '@/i18n';

export const useLanguage = () => {
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

    useEffect(() => {
        const handleLanguageChanged = (lng: string) => {
            setCurrentLanguage(lng);
        };

        i18n.on('languageChanged', handleLanguageChanged);

        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, []);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return { currentLanguage, changeLanguage };
};
