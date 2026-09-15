'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

async function fileToDataUrl(file: File, maxWidth: number): Promise<string> {
  const reader = new FileReader()
  const dataUrl = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
    reader.readAsDataURL(file)
  })

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Imagen inválida'))
    img.src = dataUrl
  })

  const scale = Math.min(1, maxWidth / image.width)
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Tu navegador no soporta esta función')

  ctx.drawImage(image, 0, 0, width, height)
  const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
  return canvas.toDataURL(mime, 0.82)
}

export function ImageUpload({
  label,
  description,
  value,
  onChange,
  maxWidth = 512,
  previewClassName,
  fieldLabel,
}: {
  label: string
  description?: string
  value: string | null
  onChange: (value: string | null) => void
  maxWidth?: number
  previewClassName?: string
  fieldLabel: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Formato no soportado. Usá PNG, JPG o WebP.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const dataUrl = await fileToDataUrl(file, maxWidth)
      onChange(dataUrl)
    } catch {
      setError('No se pudo procesar la imagen.')
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const clear = () => {
    onChange(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-muted-foreground hover:text-red-500"
            onClick={clear}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Quitar
          </Button>
        )}
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        id={`upload-${fieldLabel}`}
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      <label
        htmlFor={`upload-${fieldLabel}`}
        className={cn(
          'group flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed bg-muted/30 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5',
          previewClassName ?? 'aspect-square max-w-[7rem]',
          error && 'border-destructive'
        )}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : error ? (
          <div className="p-3 text-center text-xs text-destructive">{error}</div>
        ) : value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 p-3 text-center">
            <ImagePlus className="h-4 w-4" />
            <span className="text-[10px] font-medium leading-tight">Subir imagen</span>
          </span>
        )}
      </label>
    </div>
  )
}