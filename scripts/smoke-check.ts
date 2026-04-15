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

async function publicJson(pathname: string) {
  const response = await fetch(`${directusUrl}${pathname}`);
  if (!response.ok) {
    throw new Error(`Public fetch failed for ${pathname}: ${response.status}`);
  }
  return response.json();
}

async function webHtml(pathname: string) {
  const response = await fetch(`${webUrl}${pathname}`);
  if (!response.ok) {
    throw new Error(`Web fetch failed for ${pathname}: ${response.status}`);
  }
  return response.text();
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
    title: `Smoke audio asset ${suffix}`,
    description: "Created during smoke verification.",
    transcript: "/ɪ/",
    phonetic_focus: "smoke-check",
    license_note: "Smoke check",
    file: uploaded.data.id,
  });

  await updateItem(token, "audio_assets", String(tempAudioAsset.data.id), {
    description: "Updated during smoke verification.",
  });

  const tempLessonBlock = await createItem(token, "lesson_blocks", {
    status: "published",
    visibility: "hidden",
    module: module.id,
    slug: `smoke-hidden-${suffix}`,
    title: "Smoke hidden lesson",
    description: "Temporary lesson used to verify publish/hide/order flows.",
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
    title: "Smoke visible lesson",
  });

  const visiblePublic = await publicJson(
    `/items/lesson_blocks?filter[slug][_eq]=${encodeURIComponent(`smoke-hidden-${suffix}`)}`,
  );
  assert(visiblePublic.data.length === 1, "Visible lesson block did not appear in public API");

  const home = await webHtml("/");
  assert(home.includes("Learn to read English pronunciation without guessing."), "Home page hero missing");
  assert(home.includes("Individual phonetic symbols"), "Home page module listing missing");

  const modulePage = await webHtml("/modules/practice-lab");
  assert(modulePage.includes("Mixed listening and reading drill"), "Module page lesson listing missing");

  const symbolLesson = await webHtml("/learn/phonetic-symbols/short-i-symbol");
  assert(symbolLesson.includes("How it sounds"), "Phonetic symbol lesson content missing");
  assert(symbolLesson.includes("ship"), "Phonetic symbol examples missing");
  assert(symbolLesson.includes("audio controls"), "Phonetic symbol lesson should include audio controls");

  const ruleLesson = await webHtml("/learn/reading-rules/magic-e-rule");
  assert(ruleLesson.includes("Rule statement"), "Reading rule lesson content missing");
  assert(ruleLesson.includes("Reinforcement"), "Reading rule reinforcement section missing");

  const exerciseLesson = await webHtml("/learn/practice-lab/mvp-drill");
  assert(exerciseLesson.includes("MVP phonetics drill"), "Exercise page title missing");
  assert(exerciseLesson.includes("Check answers"), "Exercise controls missing");

  const publicCourse = await publicJson(`/items/courses?filter[slug][_eq]=phonora-mvp`);
  assert(publicCourse.data.length === 1, "Published course unavailable through public API");

  console.log("Smoke verification complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
