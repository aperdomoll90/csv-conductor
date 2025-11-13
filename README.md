# 🚀 csv-conductor

**csv-conductor** is a modern, lightweight CSV generation utility for Node and browser environments.  
It gives you full control over **column order**, **custom headers**, **computed fields**, and **per-column formatting rules**—all with zero dependencies and full TypeScript support.

Perfect for exporting data from APIs, admin dashboards, forms, spreadsheets, CRM systems, ecommerce orders, and more.

---

## ✨ Features

- **Ordered Columns** – Output always follows your defined order.
- **Custom Headers & Labels** – Map internal field names to readable column labels.
- **Computed Columns** – Insert static values or derive data for a column.
- **Per-Column Rules** – Transform, sanitize, or validate values before output.
- **Excel Friendly** – Optional UTF-8 BOM for Microsoft Excel compatibility.
- **Works in Node & Browser** – Fully portable and lightweight.
- **No Dependencies** – Tiny, clean, and tree-shakable.
- **TypeScript First** – Strong types for rows, keys, and rules.

---

## 🛠️ Technologies

- **TypeScript** – Type-safe development
- **ESM + CJS Output** – Works in any modern tooling setup
- **Zero Dependencies**

**Requirements:**

- Node.js 14+
- Works in Browser or Server environments

---

## ⚙️ Installation

```bash
npm install csv-conductor
# or
yarn add csv-conductor
```

---

## 🚀 Usage

```ts
import { generateCsv, type OrderIndicator } from 'csv-conductor'

type User = {
  first_name: string
  last_name: string
  email?: string
  active: boolean
}

const order: OrderIndicator<User> = [
  { key: 'first_name', header: 'First Name' },
  { key: 'last_name', header: 'Last Name' },
  { compute: () => 'USA', header: 'Country' },
  {
    key: 'active',
    header: 'Subscription',
    rules: [({ raw }) => (raw ? 'checked' : '')],
  },
]

const rows: User[] = [
  { first_name: 'Ada', last_name: 'Lovelace', active: true },
  { first_name: 'Grace', last_name: 'Hopper', active: false },
]

const csv = generateCsv(rows, order)

console.log(csv)
```

✅ Output:

```
First Name,Last Name,Country,Subscription
"Ada","Lovelace","USA","checked"
"Grace","Hopper","USA",""
```

---

## 🔧 Configuration API

### `generateCsv<T>(rows, order, options?)`

| Option       | Type                | Default  | Description                  |        |                                                |
| ------------ | ------------------- | -------- | ---------------------------- | ------ | ---------------------------------------------- |
| `delimiter`  | `string`            | `','`    | Column separator             |        |                                                |
| `quote`      | `'"'                | "'"      | null`                        | `'\"'` | How cells are quoted (`null` disables quoting) |
| `eol`        | `string`            | `'\n'`   | Line break (`\n` or `\r\n`)  |        |                                                |
| `includeBOM` | `boolean`           | `true`   | Prepends BOM for Excel       |        |                                                |
| `stringify`  | `(value) => string` | built-in | Custom serializer for values |        |                                                |

### Column Types

✅ **Keyed Column** (maps directly to object field)

```ts
{ key: 'email', header: 'Email' }
```

✅ **Computed Column**

```ts
{ compute: () => 'USA', header: 'Country' }
```

✅ **Column Rules** (sanitize, transform, format)

```ts
{
  key: 'active',
  header: 'Active',
  rules: [({ raw }) => raw ? 'yes' : 'no']
}
```

✅ **Default Values**

```ts
{ key: 'email', header: 'Email', defaultValue: 'n/a' }
```

---

## 🧪 Example With Rules

```ts
import { generateCsv } from 'csv-conductor'

const trim =
  () =>
  ({ value }: any) =>
    value.trim()
const asChecked =
  () =>
  ({ raw }: any) =>
    raw ? 'checked' : ''

const order = [
  { key: 'name', header: 'Name', rules: [trim()] },
  { compute: () => 'USA', header: 'Country' },
  { key: 'active', header: 'Active', rules: [asChecked()] },
]

const csv = generateCsv(
  [
    { name: ' Ada ', active: true },
    { name: 'Grace ', active: false },
  ],
  order
)

console.log(csv)
```

---

## 🧭 Roadmap

### ✅ Already Implemented

- Ordered CSV columns
- Custom headers / labels
- Computed column values
- Per-column rules
- Default/fallback values
- Excel-friendly UTF-8 BOM
- Works in Node & Browser
- TypeScript definitions
- Zero dependencies

### 🚧 Planned Features

- [ ] Built-in formatting helpers (dates, masking, currency)
- [ ] Mapping tables / enum formatters
- [ ] Strict validation modes
- [ ] Streaming output for very large datasets
- [ ] Async rule support for external lookups

---

## 🤝 Contributing

PRs and issues welcome!

1. Fork the repo
2. Create a branch:

   ```bash
   git checkout -b feature/myFeature
   ```

3. Commit changes
4. Push your branch
5. Open a Pull Request

---

## 📄 License

MIT License.

---

## 📞 Contact

**Adrian Perdomo**
GitHub: [aperdomoll90/csv-conductor](https://github.com/aperdomoll90/csv-conductor)
