/* Each press item its own file under ./press/, globbed and sorted by id. */
const modules = import.meta.glob("./press/*.json", { eager: true });
const press = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.number - b.number);
export default press;
