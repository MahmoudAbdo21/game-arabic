import fs from 'fs';
import path from 'path';
import { LessonData, LessonDataSchema, LessonPresentation, LessonPresentationSchema } from './schema';

export function getLessonData(islandId: string): LessonData {
  const filePath = path.join(process.cwd(), 'src', 'content', 'islands', islandId, 'data.json');
  if (!fs.existsSync(filePath)) {
    throw new Error(`Canonical data not found for ${islandId}`);
  }
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const rawData = JSON.parse(fileContent);
  const result = LessonDataSchema.safeParse(rawData);
  if (!result.success) {
    console.error("Validation errors:", result.error.issues);
    throw new Error(`Canonical data for ${islandId} is invalid`);
  }
  return result.data;
}

export function getPresentationData(islandId: string): LessonPresentation | null {
  const filePath = path.join(process.cwd(), 'src', 'content', 'islands', islandId, 'presentation.json');
  if (!fs.existsSync(filePath)) {
    return null; // Presentation data is additive, so it might not exist yet
  }
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const rawData = JSON.parse(fileContent);
  const result = LessonPresentationSchema.safeParse(rawData);
  if (!result.success) {
    console.error(`Presentation validation errors for ${islandId}:`, result.error.issues);
    return null; // Fallback gracefully if validation fails
  }
  return result.data;
}

export function validateAllLessons() {
  const islandsDir = path.join(process.cwd(), 'src', 'content', 'islands');
  if (!fs.existsSync(islandsDir)) return true;
  const islands = fs.readdirSync(islandsDir);
  let allValid = true;
  for (const islandId of islands) {
    try {
      getLessonData(islandId);
      console.log(`Island ${islandId} validated successfully.`);
    } catch (e) {
      console.error(`Island ${islandId} validation failed:`, e);
      allValid = false;
    }
  }
  return allValid;
}