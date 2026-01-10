# FSD-GEN  
## CLI-генератор React-компонентов по Feature-Sliced Design

---

## 1. Назначение

`fsd-gen` — CLI-генератор React-компонентов для проектов, использующих архитектуру **Feature-Sliced Design (FSD)**.

Цели генератора:
- ускорить создание новых компонентов
- обеспечить единообразную архитектуру
- исключить ручные ошибки в структуре проекта
- автоматизировать рутину (шаблоны, импорты, barrel-файлы)
- навязать архитектурную дисциплину

---

## 2. Технологические требования

### Используемые технологии
- Node.js ≥ 18
- React + TypeScript
- `@emotion/styled`

### Ограничения (обязательно)
- ❌ Material UI
- ❌ CSS / SCSS / CSS Modules
- ❌ `css()` helpers
- ❌ inline styles

### Разрешено
- только `styled.div\`...\`` (template literals)
- строгая типизация
- `Record<Variant, string>` для variants

---

## 3. Архитектура генератора

```
fsd-gen/
  cli.js
  src/
    config/
      types.ts
      defineConfig.ts
    lib/
      config/
        loadConfig.ts
        defaultConfig.ts
        deepMerge.ts
        validateConfig.ts
        warnConfig.ts
      naming/
      aliases/
      graph/
      barrels/
      preview/
      conflicts/
      templates/
  templates/
    shared/
    entity/
    feature/
    widget/
    page/
```

---

## 4. Конфигурация генератора

### 4.1 Формат конфигурации

В корне проекта:

```ts
import { defineConfig } from "fsd-gen";

export default defineConfig({
  rootDir: "src",
});
```

### 4.2 Поддержка TypeScript

- Конфиг `fsdgen.config.ts` поддерживается через **опциональный `tsx`**
- Если `tsx` не установлен — генератор выдаёт понятную ошибку

### 4.3 Приоритет настроек

1. Ответы пользователя в CLI  
2. Конфиг проекта  
3. Дефолты генератора  

---

## 5. Основные возможности

### 5.1 Dependency Graph

Генератор строит граф зависимостей между слоями:

```
entity → feature → widget → page
```

Каждый узел:
- слой
- slice
- имя компонента
- шаблон

Используется для правильного порядка генерации и передачи зависимостей в шаблоны.

---

### 5.2 Alias-awareness

Автоматическая работа с алиасами импортов.

Источники:
1. manual aliases из конфига
2. tsconfig paths
3. fallback `@/` → rootDir

---

### 5.3 Автообновление barrel-файлов

Генератор автоматически:
- создаёт `index.ts`
- добавляет export
- не дублирует существующие

---

### 5.4 Naming Policy Enforcement

Контроль:
- имён компонентов
- slice
- суффиксов (`Page`, `Widget`)
- variants

Режимы: `error | warn | autoFix`

---

### 5.5 Preview / Explain Mode

Перед генерацией показывается:
- список файлов
- порядок
- зависимости
- конфликты

Dry-run ничего не пишет на диск.

---

### 5.6 Interactive Rename

При конфликтах:
- ask
- rename
- merge
- abort

---

## 6. Шаблоны генерации

Каждый UI-шаблон создаёт:

```
ui/
  Component.tsx
  Component.styles.ts
```

Variant-паттерн:

```ts
type Variant = "primary" | "secondary";

const variantStyles: Record<Variant, string> = {
  primary: `...`,
  secondary: `...`,
};

export const Root = styled.div<{ variant: Variant }>`
  ${({ variant }) => variantStyles[variant]}
`;
```

---

## 7. Поддерживаемые шаблоны

- shared: ui-basic, ui-polymorphic, ui-primitive
- entity: model-ui-basic, model-ui-readonly
- feature: ui-model-basic, ui-model-confirm, ui-model-form
- widget: ui-basic, ui-layout, ui-data
- page: ui-basic, ui-layout, ui-routing-shell

---

## 8. Ошибки и предупреждения

Fatal:
- невалидный конфиг
- неизвестные слои

Warnings:
- отсутствующие шаблоны
- пустые variants

---

## 9. Критерии приёмки

Генератор:
- работает с `defineConfig`
- соблюдает FSD
- использует aliases
- обновляет barrel-файлы
- поддерживает preview и dry-run

---

## 10. Итог

`fsd-gen` — это архитектурный инструмент, а не просто генератор.
