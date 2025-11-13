

export type IRowProps = Record<string, unknown>
export type IFieldLabelMapProps = Record<string, string>
export type ICsvRulesProps<T extends IRowProps> = {
  /**
   * For headers that are NOT mapped to a field key,
   * provide a constant value or a function that derives a value from the row.
   */
  staticByHeader?: Record<string, string | number | boolean | Date | null | undefined | ((row: T) => unknown)>

  /**
   * Per-header formatter. Useful for booleans, dates, phone normalization, etc.
   * Runs AFTER we pick a value (from field or from static) and formats that value.
   */
  formatByHeader?: Record<string, (value: unknown, row: T) => string>
}

/** sanitize unsafe CSV text */
export function sanitizeCsvValue(value: unknown): string {
  if (value == null) return '""' // empty cell
  const stringValue = String(value).replace(/"/g, '""') // double inner quotes
  return `"${stringValue}"` // wrap in quotes
}

/** Build Label → fieldKey reverse lookup (e.g., "First Name" → "first_name") */
function buildLabelToFieldKeyMap(fieldLabelMap: IFieldLabelMapProps) {
  const reverse: Record<string, string> = {}
  for (const fieldKey of Object.keys(fieldLabelMap)) {
    const label = fieldLabelMap[fieldKey]
    reverse[label] = fieldKey
  }
  return reverse
}

/**
 *
 * 1) rows                 - your full data array
 * 2) fieldLabelMap        - maps DB fields to header names
 * 3) orderedHeaderLabels  - exact final CSV column order (headers)
 * 4) rules                - (optional) static values & per-header formatters
 */

export function generateCSV<T extends IRowProps>(
  rows: T[],
  fieldLabelMap: IFieldLabelMapProps,
  orderedHeaderLabels: string[],
  rules?: ICsvRulesProps<T>
): string {
  const labelToFieldKey = buildLabelToFieldKeyMap(fieldLabelMap)

  // 1) Header row (already ordered by orderedHeaderLabels)
  const headerRow = orderedHeaderLabels.map(label => sanitizeCsvValue(label)).join(',')

  // 2) Body rows (cells in the same order as headers)
  const bodyRows = rows
    .map(row => {
      const cells = orderedHeaderLabels.map(label => {
        // Step A: start with the mapped field value if this label maps to a field
        const fieldKey = labelToFieldKey[label]
        let rawValue: unknown = fieldKey ? row[fieldKey] : undefined

        // Step B: if no field value (or label is unmapped), try a static rule
        if (rawValue === undefined && rules?.staticByHeader && label in rules.staticByHeader) {
          const staticVal = rules.staticByHeader[label]
          rawValue = typeof staticVal === 'function' ? (staticVal as (r: T) => unknown)(row) : staticVal
        }

        // Default empty if still undefined/null
        if (rawValue == null) rawValue = ''

        // Step C: apply per-header formatter if provided
        const formatted = rules?.formatByHeader?.[label] ? rules.formatByHeader[label](rawValue, row) : rawValue

        // Step D: objects/arrays → JSON string, primitives stay as-is
        const printable = typeof formatted === 'object' && formatted !== null ? JSON.stringify(formatted) : formatted

        return sanitizeCsvValue(printable)
      })

      return cells.join(',')
    })
    .join('\n')

  return `${headerRow}\n${bodyRows}`
}
