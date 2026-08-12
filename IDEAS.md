# Ideas inbox

Capture product/tech ideas here. **Do not implement** until the owner explicitly asks to build a specific idea (by id or title).

## How to use (with the agent)

| You say | Agent does |
|---------|------------|
| «идея: …» / «запиши идею …» | Appends a new row with status `inbox` |
| «какие идеи» / «что в бэклоге» | Lists open ideas from this file |
| «реализуй IDEA-003» / «сделай идею про …» | Implements **only** that idea |
| «отложи IDEA-002» / «готово IDEA-001» | Updates status |

## Statuses

- `inbox` — записано, не трогаем
- `ready` — можно брать в работу (после уточнения)
- `doing` — сейчас делается
- `done` — сделано (кратко куда ушло)
- `dropped` — отказались

## Ideas

| ID | Date | Status | Idea | Notes |
|----|------|--------|------|-------|
| IDEA-001 | 2026-08-12 | inbox | После обкатки веб-PWA перенести функционал на React Native | Уже в roadmap/ADR; держать как напоминание до старта RN-фазы |
| IDEA-002 | 2026-08-12 | inbox | Настраиваемые шкалы нутриентов на Today: добавлять свои (напр. вода — план и потребление) и/или скрывать дефолтные (kcal/protein/fat/carbs) | Касается NutrientBar / goals / возможно Settings |
| IDEA-003 | 2026-08-12 | inbox | Постоянные / любимые блюда: быстро логировать одни и те же приёмы пищи без повторного ввода количества каждый раз | Частично пересекается с Fridge + lastUsed; возможно «шаблоны приёма» или one-tap favorites |
