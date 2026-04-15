import path from "node:path";

import {
  createItem,
  directusRequest,
  directusUpload,
  getAdminToken,
  readItems,
  updateItem,
} from "./directus-utils";

const directusUrl = (process.env.DIRECTUS_URL ?? "http://localhost:8055").replace(/\/$/, "");
const webUrl = (process.env.WEB_URL ?? "http://localhost:3000").replace(/\/$/, "");

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const localizedText = (field: string, en: string, ru: string) => ({
  [`${field}_en`]: en,
  [`${field}_ru`]: ru,
});

async function publicJson(pathname: string) {
  const response = await fetch(`${directusUrl}${pathname}`);
  if (!response.ok) {
    throw new Error(`Public fetch failed for ${pathname}: ${response.status}`);
  }
  return response.json();
}

async function webHtml(pathname: string, init?: RequestInit) {
  const response = await fetch(`${webUrl}${pathname}`, init);
  if (!response.ok) {
    throw new Error(`Web fetch failed for ${pathname}: ${response.status}`);
  }
  return response.text();
}

async function webResponse(pathname: string, init?: RequestInit) {
  return fetch(`${webUrl}${pathname}`, init);
}

async function main() {
  const token = await getAdminToken();

  const moduleResponse = await readItems<{ id: string; slug: string }>(
    token,
    "modules",
    "?filter[slug][_eq]=practice-lab&limit=1",
  );
  const exerciseResponse = await readItems<{ id: string; slug: string }>(
    token,
    "exercises",
    "?filter[slug][_eq]=mvp-drill&limit=1",
  );
  const audioAssetResponse = await readItems<{ id: string; title: string }>(
    token,
    "audio_assets",
    "?limit=1",
  );

  const module = moduleResponse.data[0];
  const exercise = exerciseResponse.data[0];
  const existingAudioAsset = audioAssetResponse.data[0];

  assert(module, "Practice module not found");
  assert(exercise, "Exercise not found");
  assert(existingAudioAsset, "No audio asset found");

  const suffix = Date.now();
  const tempFileTitle = `Smoke upload ${suffix}`;
  const uploaded = await directusUpload(
    token,
    path.join(process.cwd(), "cms/assets/short-i-symbol.wav"),
    tempFileTitle,
  );

  const tempAudioAsset = await createItem(token, "audio_assets", {
    status: "published",
    ...localizedText("title", `Smoke audio asset ${suffix}`, `Тестовый аудиоресурс ${suffix}`),
    ...localizedText(
      "description",
      "Created during smoke verification.",
      "Создано во время smoke-проверки.",
    ),
    transcript: "/ɪ/",
    phonetic_focus: "smoke-check",
    license_note: "Smoke check",
    file: uploaded.data.id,
  });

  await updateItem(token, "audio_assets", String(tempAudioAsset.data.id), {
    ...localizedText(
      "description",
      "Updated during smoke verification.",
      "Обновлено во время smoke-проверки.",
    ),
  });

  const tempLessonBlock = await createItem(token, "lesson_blocks", {
    status: "published",
    visibility: "hidden",
    module: module.id,
    slug: `smoke-hidden-${suffix}`,
    ...localizedText("title", "Smoke hidden lesson", "Скрытый smoke-урок"),
    ...localizedText(
      "description",
      "Temporary lesson used to verify publish/hide/order flows.",
      "Временный урок для проверки публикации, скрытия и порядка.",
    ),
    lesson_type: "exercise",
    order: 99,
    estimated_minutes: 1,
    exercise: exercise.id,
  });

  const hiddenPublic = await publicJson(
    `/items/lesson_blocks?filter[slug][_eq]=${encodeURIComponent(`smoke-hidden-${suffix}`)}`,
  );
  assert(hiddenPublic.data.length === 0, "Hidden lesson block leaked into public API");

  await updateItem(token, "lesson_blocks", String(tempLessonBlock.data.id), {
    visibility: "visible",
    order: 2,
    ...localizedText("title", "Smoke visible lesson", "Видимый smoke-урок"),
  });

  const visiblePublic = await publicJson(
    `/items/lesson_blocks?filter[slug][_eq]=${encodeURIComponent(`smoke-hidden-${suffix}`)}`,
  );
  assert(visiblePublic.data.length === 1, "Visible lesson block did not appear in public API");

  const rootRu = await webResponse("/", {
    redirect: "manual",
    headers: { "accept-language": "ru-RU,ru;q=0.9" },
  });
  assert(rootRu.status >= 300 && rootRu.status < 400, "Root should redirect to a locale path");
  assert(rootRu.headers.get("location") === "/ru", "Root redirect should respect Russian preference");

  const homeEn = await webHtml("/en");
  assert(homeEn.includes("Learn to read English pronunciation without guessing."), "English home hero missing");
  assert(homeEn.includes("Individual phonetic symbols"), "English home module listing missing");

  const homeRu = await webHtml("/ru");
  assert(homeRu.includes("Научитесь читать английское произношение без догадок."), "Russian home hero missing");
  assert(homeRu.includes("Отдельные фонетические символы"), "Russian home module listing missing");
  assert(homeRu.includes("Русский"), "Language switcher missing on Russian home page");

  const modulePageRu = await webHtml("/ru/modules/practice-lab");
  assert(modulePageRu.includes("Смешанная тренировка на аудирование и чтение"), "Russian module page lesson listing missing");

  const symbolLessonRu = await webHtml("/ru/learn/phonetic-symbols/short-i-symbol");
  assert(symbolLessonRu.includes("Как это звучит"), "Russian phonetic symbol lesson content missing");
  assert(symbolLessonRu.includes("корабль"), "Russian phonetic symbol examples missing");
  assert(symbolLessonRu.includes("audio controls"), "Phonetic symbol lesson should include audio controls");

  const ruleLessonEn = await webHtml("/en/learn/reading-rules/magic-e-rule");
  assert(ruleLessonEn.includes("Rule statement"), "English reading rule lesson content missing");
  assert(ruleLessonEn.includes("Reinforcement"), "English reading rule reinforcement section missing");

  const exerciseLessonRu = await webHtml("/ru/learn/practice-lab/mvp-drill");
  assert(exerciseLessonRu.includes("MVP-тренировка по фонетике"), "Russian exercise page title missing");
  assert(exerciseLessonRu.includes("Проверить ответы"), "Russian exercise controls missing");

  const publicCourse = await publicJson(`/items/courses?filter[slug][_eq]=phonora-mvp`);
  assert(publicCourse.data.length === 1, "Published course unavailable through public API");

  console.log("Smoke verification complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
