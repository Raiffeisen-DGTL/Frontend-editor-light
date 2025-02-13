# Редактор для проведения собеседований

## Устройство

Статический редактор на основе monaco-code-editor и @babel/standalone

## Поддерживает

-   React
-   ReactDOM
-   Styled-components
-   Typescript

## Назначение

Проведение технических интервью с шарингом экрана, для проверки знаний разработки Frontend

## Моковые fetch запросы

У редактора есть возможность обрабатывать моковые fetch запросы, для этого нужно передать в запросе заголовок `X-Mock-Fetch-Type` с типом запроса.
Есть два вида запросов:

-   **standart**: обрабатывается как обычный fetch и отвечает моковыми данными
-   **slow**: возвращает моковые данные с задержкой которую вы передаете через еще один заголовок `X-Mock-Fetch-Delay` или 3 секунды по-умолчанию.

Пример slow запроса:

```javascript
fetch('https://mock', {
    method: 'GET',
    headers: {
        'X-Mock-Fetch-Type': 'slow',
        'X-Mock-Fetch-Delay': '1000',
    },
})
    .then((response) => response.json())
    .then((data) => console.log(data));
```
