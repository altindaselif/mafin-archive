/*
 * Each milestone lives in its own file under ./timeline/. Globbed at build
 * time and exposed as a single array sorted by episode number, so the rest
 * of the app keeps importing the timeline exactly as before.
 */
const modules = import.meta.glob("./timeline/*.json", { eager: true });

const milestones = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.number - b.number);

export default milestones;
