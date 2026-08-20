/* Each character its own file under ./characters/, globbed and kept in the
   original order via the `order` field (also editable in the CMS). */
const modules = import.meta.glob("./characters/*.json", { eager: true });
const characters = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.number - b.number);
export default characters;
