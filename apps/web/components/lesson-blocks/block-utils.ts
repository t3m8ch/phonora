import { type Locale, resolveLocalizedValue } from "@/lib/i18n";
import type { AudioAsset } from "@/lib/types";

export type LocalizedBlockText = {
  en?: string | null;
  ru?: string | null;
};

export const blockText = (value: LocalizedBlockText | undefined, locale: Locale) =>
  resolveLocalizedValue(value ?? {}, locale) ?? "";

export const audioFromBlock = ({
  id,
  title,
  audio,
  audioUrl,
  audioAssetId,
}: {
  id: string;
  title: string;
  audio?: AudioAsset | null;
  audioUrl?: string | null;
  audioAssetId?: string | null;
}) => {
  if (audio) {
    return audio;
  }

  const url = audioUrl ?? audioAssetId ?? "";
  if (!url) {
    return null;
  }

  return {
    id,
    title,
    url,
    description: null,
    transcript: null,
    phoneticFocus: null,
  };
};
