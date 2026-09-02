'use client';

import { Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SUPPORTED_LOCALES, type AppLocale } from '@/lib/i18n/config';
import { setLocaleCookie } from '@/lib/i18n/set-locale-action';

const LOCALE_LABEL: Record<AppLocale, string> = { en: 'English', de: 'Deutsch' };

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n } = useTranslation();
  const router = useRouter();
  const [, startTransition] = useTransition();

  function selectLocale(locale: AppLocale) {
    i18n.changeLanguage(locale);
    startTransition(() => {
      setLocaleCookie(locale).then(() => router.refresh());
    });
  }

  const localeLabel = LOCALE_LABEL[i18n.language as AppLocale] ?? LOCALE_LABEL.en;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? "icon-sm" : "sm"}
          className={compact ? undefined : "gap-1.5"}
          aria-label={localeLabel}
        >
          <Globe className="size-4" />
          {compact ? null : localeLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LOCALES.map((locale) => (
          <DropdownMenuItem key={locale} onSelect={() => selectLocale(locale)}>
            {LOCALE_LABEL[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
