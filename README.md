# csv-conductor

A lightweight, type-safe CSV generation utility for Node and browser environments.

Control column order, map field names to headers, add computed columns, and format values—all with zero dependencies and full TypeScript support.

---

## Features

- **Ordered Columns** – Output follows your defined header order
- **Field-to-Header Mapping** – Map internal field names to readable column labels
- **Static & Computed Columns** – Insert constant values or derive data per row
- **Per-Column Formatting** – Transform values before output (dates, booleans, etc.)
- **Browser Download** – Built-in helper with File System Access API support
- **Excel Friendly** – UTF-8 BOM for Microsoft Excel compatibility
- **Works in Node & Browser** – Fully portable and lightweight
- **No Dependencies** – Tiny, clean, and tree-shakable
- **TypeScript First** – Strong types for rows, rules, and formatters

---

## Installation

```bash
npm install csv-conductor
# or
yarn add csv-conductor
```

---

## Quick Start

```ts
import { generateCSV, downloadCSV } from 'csv-conductor'

type User = {
  first_name: string
  last_name: string
  email: string
  active: boolean
}

// 1. Map your data fields to header labels
const fieldLabelMap = {
  first_name: 'First Name',
  last_name: 'Last Name',
  email: 'Email',
  active: 'Status',
}

// 2. Define column order using header labels
const orderedHeaders = ['First Name', 'Last Name', 'Email', 'Country', 'Status']

// 3. Your data
const users: User[] = [
  { first_name: 'Ada', last_name: 'Lovelace', email: 'ada@example.com', active: true },
  { first_name: 'Grace', last_name: 'Hopper', email: 'grace@example.com', active: false },
]

// 4. Generate CSV with rules for static/computed columns and formatting
const csv = generateCSV(users, fieldLabelMap, orderedHeaders, {
  staticByHeader: {
    Country: 'USA', // constant value
  },
  formatByHeader: {
    Status: (value) => (value ? 'Active' : 'Inactive'),
  },
})

console.log(csv)
```

Output:

```
"First Name","Last Name","Email","Country","Status"
"Ada","Lovelace","ada@example.com","USA","Active"
"Grace","Hopper","grace@example.com","USA","Inactive"
```

---

## API

### `generateCSV<T>(rows, fieldLabelMap, orderedHeaderLabels, rules?)`

Generates a CSV string from your data.

| Parameter             | Type                   | Description                                      |
| --------------------- | ---------------------- | ------------------------------------------------ |
| `rows`                | `T[]`                  | Array of data objects                            |
| `fieldLabelMap`       | `Record<string, string>` | Maps object keys to header labels              |
| `orderedHeaderLabels` | `string[]`             | Header labels in desired column order            |
| `rules`               | `ICsvRulesProps<T>`    | Optional static values and formatters            |

#### Rules Object

```ts
type ICsvRulesProps<T> = {
  // For headers NOT mapped to a field, provide a constant or computed value
  staticByHeader?: Record<string, string | number | boolean | Date | null | ((row: T) => unknown)>

  // Per-header formatter, runs after value is resolved
  formatByHeader?: Record<string, (value: unknown, row: T) => string>
}
```

---

### `downloadCSV(content, fileName)`

Downloads a CSV string as a file in the browser.

| Parameter  | Type     | Description                    |
| ---------- | -------- | ------------------------------ |
| `content`  | `string` | The CSV string to download     |
| `fileName` | `string` | Suggested filename (e.g. `"export.csv"`) |

Returns `Promise<boolean>` – `true` if download succeeded, `false` if canceled or failed.

```ts
import { generateCSV, downloadCSV } from 'csv-conductor'

const csv = generateCSV(data, fieldMap, headers)
const success = await downloadCSV(csv, 'users-export.csv')

if (success) {
  console.log('Downloaded!')
}
```

**Browser support:**
- Uses File System Access API when available (shows native save dialog)
- Falls back to anchor download for older browsers
- Automatically adds UTF-8 BOM for Excel compatibility

---

### `sanitizeCsvValue(value)`

Utility to escape and quote a single value for CSV output.

```ts
import { sanitizeCsvValue } from 'csv-conductor'

sanitizeCsvValue('Hello "World"') // → '"Hello ""World"""'
sanitizeCsvValue(null)            // → '""'
```

---

## Examples

### Static and Computed Columns

```ts
const csv = generateCSV(users, fieldLabelMap, headers, {
  staticByHeader: {
    // Constant value for all rows
    'Source': 'Web Import',

    // Computed value per row
    'Full Name': (row) => `${row.first_name} ${row.last_name}`,
  },
})
```

### Formatting Values

```ts
const csv = generateCSV(orders, fieldLabelMap, headers, {
  formatByHeader: {
    // Boolean to text
    'Paid': (value) => value ? 'Yes' : 'No',

    // Date formatting
    'Created At': (value) => new Date(value as string).toLocaleDateString(),

    // Currency
    'Total': (value) => `$${(value as number).toFixed(2)}`,
  },
})
```

### Combining Static Values and Formatters

```ts
const csv = generateCSV(rows, fieldLabelMap, headers, {
  staticByHeader: {
    'Export Date': () => new Date().toISOString(),
  },
  formatByHeader: {
    'Active': (val) => val ? 'checked' : '',
  },
})
```

---

## Types

```ts
import type {
  IRowProps,           // Record<string, unknown> - base row type
  IFieldLabelMapProps, // Record<string, string> - field to label mapping
  ICsvRulesProps,      // Rules for static values and formatters
} from 'csv-conductor'
```

---

## Requirements

- Node.js 14+ or modern browser
- TypeScript 4.5+ (for types)

---

## Contributing

PRs and issues welcome!

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit changes
4. Push and open a Pull Request

---

## License

MIT

---

## Author

**Adrian Perdomo**
GitHub: [aperdomoll90/csv-conductor](https://github.com/aperdomoll90/csv-conductor)
