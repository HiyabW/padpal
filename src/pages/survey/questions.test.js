import { surveyQuestions } from "./questions";

test("all survey question ids are unique", () => {
  const ids = surveyQuestions.map((q) => q.id);
  const uniqueIds = new Set(ids);
  expect(uniqueIds.size).toBe(ids.length);
});
