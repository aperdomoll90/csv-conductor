type IFileSystemWritableFileStreamProps = {
  write(data: Blob | string): Promise<void>
  close(): Promise<void>
}
type IFileSystemFileHandleProps = {
  createWritable(): Promise<IFileSystemWritableFileStreamProps>
}
type ISaveFilePickerOptionsProps = {
  suggestedName?: string
  types?: Array<{ description?: string; accept: Record<string, string[]> }>
}
type IGlobalWithSavePickerProps = typeof globalThis & {
  showSaveFilePicker?: (options?: ISaveFilePickerOptionsProps) => Promise<IFileSystemFileHandleProps>
}

/**
 * Download CSV content as a file.
 * - Uses File System Access API when available (confirmable success).
 * - Falls back to an <a download> link (best-effort success).
 *
 * Returns true when we *believe* the flow succeeded.
 */
export const downloadCSV = async (content: string, fileName: string): Promise<boolean> => {
  // Add BOM so Excel opens UTF-8 correctly (José → not garbled)
  const blob = new Blob([`\uFEFF${content}`], {
    type: 'text/csv;charset=utf-8;',
  })

  const anyNav = globalThis as IGlobalWithSavePickerProps

  // Preferred: modern save dialog with confirmed write
  if (typeof anyNav.showSaveFilePicker === 'function') {
    try {
      const handle = await anyNav.showSaveFilePicker({
        suggestedName: fileName,
        types: [{ description: 'CSV', accept: { 'text/csv': ['.csv'] } }],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return true
    } catch (err: unknown) {
      // If the user canceled, report false to the UI.
      // Otherwise (blocked/unsupported in iframe, security error, etc.), fall back.
        const error = err as { name?: string; message?: string }
        
      const name = error?.name || ''
      if (name === 'AbortError' || (name === 'NotAllowedError' && error?.message?.includes('user gesture'))) {
        console.error('downloadCSV: user canceled picker', error)
        return false
      }
      console.warn('downloadCSV: picker failed, falling back to anchor', error)
      // continue to fallback below
    }
  }

  // Fallback: object URL + anchor click (cannot fully confirm success)
  try {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName || 'export.csv'
    link.rel = 'noopener'
    link.style.position = 'fixed'
    link.style.left = '-9999px'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    return true // best we can say
  } catch (err) {
    console.error('downloadCSV: fallback failed', err)
    return false
  }
}
