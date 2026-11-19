'use client'

import { use, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Boxes,
  ImagePlus,
  Loader2,
  Package,
  Scale,
  ShieldCheck,
  Store,
  X,
} from 'lucide-react'
import { productsService } from '@/features/products/services/products.service'
import type { Product, ProductDetail } from '@/features/products/types'

const MAX_IMAGES = 10
const MIN_RECOMMENDED_IMAGES = 5

const inputCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring'

function formatUsd(value?: string | null) {
  if (value == null || value === '') return '—'
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(value?: string | null) {
  return value ? value.slice(0, 10) : '—'
}

function cbm(product: Product) {
  return (Number(product.boxLengthM) * Number(product.boxWidthM) * Number(product.boxHeightM)).toFixed(4)
}

function ProductImage({ src, alt, className = '' }: { src?: string | null; alt: string; className?: string }) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <Package className="size-8 text-muted-foreground" />
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={`object-cover ${className}`} />
  )
}

function RelatedProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/40"
    >
      <ProductImage src={product.imageUrls?.[0]} alt={product.description} className="aspect-square w-full" />
      <div className="p-3">
        <p className="truncate text-sm font-semibold">{product.sku}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
        <p className="mt-2 text-sm font-semibold text-primary">{formatUsd(product.unitFobPriceUsd)}</p>
      </div>
    </Link>
  )
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    productsService
      .get(id)
      .then((data) => {
        setProduct(data)
        setSelectedImage(0)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo cargar el producto'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  async function uploadImages(files: FileList | null) {
    if (!files?.length || !product) return
    const remaining = MAX_IMAGES - (product.imageUrls?.length ?? 0)
    if (remaining <= 0) {
      setError(`Máximo ${MAX_IMAGES} imágenes por producto`)
      return
    }

    setUploading(true)
    setError(null)
    try {
      const next = await productsService.uploadImages(id, Array.from(files).slice(0, remaining))
      setProduct(next)
      setSelectedImage(next.imageUrls?.length ? next.imageUrls.length - 1 : 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron subir las imágenes')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function removeImage(index: number) {
    if (!product) return
    const imageUrls = (product.imageUrls ?? []).filter((_, i) => i !== index)
    setError(null)
    try {
      const next = await productsService.update(id, { imageUrls })
      setProduct(next)
      setSelectedImage((current) => Math.min(current, Math.max(0, imageUrls.length - 1)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la imagen')
    }
  }

  if (loading && !product) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </main>
    )
  }
  if (!product) {
    return <main className="p-6 text-sm text-destructive">{error ?? 'Producto no encontrado'}</main>
  }

  const images = product.imageUrls ?? []
  const activeImage = images[selectedImage] ?? images[0] ?? null
  const visibleThumbs = Math.max(images.length, MIN_RECOMMENDED_IMAGES)
  const related = product.relatedProducts ?? []

  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 border-b border-border bg-card px-4 py-3">
        <Link href="/products" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Productos
        </Link>
        <div className="mt-1 flex items-start justify-between gap-3">
          <div>
            <h1 className="font-bold">{product.sku}</h1>
            <p className="text-xs text-muted-foreground">{product.description}</p>
          </div>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            {cbm(product)} CBM/caja
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-5 p-4">
        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <section className="grid gap-5 rounded-xl border border-border bg-card p-4 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
              <ProductImage src={activeImage} alt={product.description} className="size-full" />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <Loader2 className="size-8 animate-spin text-primary" />
                </div>
              )}
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {Array.from({ length: visibleThumbs }).map((_, index) => {
                const src = images[index]
                const isSelected = src ? index === selectedImage : false
                return (
                  <div key={src ?? `empty-${index}`} className="relative size-16 shrink-0">
                    {src ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelectedImage(index)}
                          className={`size-full overflow-hidden rounded-lg border ${isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-border'}`}
                          aria-label={`Ver imagen ${index + 1}`}
                        >
                          <ProductImage src={src} alt={`${product.sku} ${index + 1}`} className="size-full" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
                          aria-label={`Eliminar imagen ${index + 1}`}
                        >
                          <X className="size-3" />
                        </button>
                      </>
                    ) : (
                      <div className="flex size-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/50">
                        <Package className="size-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(e) => uploadImages(e.target.files)}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || images.length >= MAX_IMAGES}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
              >
                {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
                {images.length ? 'Agregar imágenes' : 'Subir imágenes'}
              </button>
              <span className="text-xs text-muted-foreground">
                {images.length}/{MAX_IMAGES} fotos
                {images.length < MIN_RECOMMENDED_IMAGES ? ' · se recomiendan al menos 5' : ''}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">SKU</p>
              <h2 className="text-xl font-bold">{product.sku}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            </div>

            <div className="rounded-xl bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">Precio FOB unitario</p>
              <p className="text-2xl font-bold text-primary">{formatUsd(product.unitFobPriceUsd)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {product.unitsPerBox} unidades por caja
                {product.boxesPerPallet ? ` · ${product.boxesPerPallet} cajas/palé` : ''}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-border p-3">
                <dt className="flex items-center gap-1 text-xs text-muted-foreground"><Boxes className="size-3.5" /> CBM/caja</dt>
                <dd className="mt-1 font-semibold">{cbm(product)}</dd>
              </div>
              <div className="rounded-lg border border-border p-3">
                <dt className="flex items-center gap-1 text-xs text-muted-foreground"><Scale className="size-3.5" /> Peso caja</dt>
                <dd className="mt-1 font-semibold">{product.boxGrossWeightKg ? `${Number(product.boxGrossWeightKg).toLocaleString()} kg` : '—'}</dd>
              </div>
              <div className="rounded-lg border border-border p-3">
                <dt className="flex items-center gap-1 text-xs text-muted-foreground"><Store className="size-3.5" /> Proveedor</dt>
                <dd className="mt-1 font-semibold">
                  {product.vendor?.id ? (
                    <Link href={`/vendors/${product.vendor.id}`} className="text-primary hover:underline">
                      {product.vendor.name}
                    </Link>
                  ) : (
                    product.vendor?.name ?? '—'
                  )}
                </dd>
              </div>
              <div className="rounded-lg border border-border p-3">
                <dt className="flex items-center gap-1 text-xs text-muted-foreground"><ShieldCheck className="size-3.5" /> Partida arancelaria</dt>
                <dd className="mt-1 font-semibold">
                  {product.tariffHeading ? `HS ${product.tariffHeading.hsCode}` : '—'}
                </dd>
              </div>
            </dl>

            <dl className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <dt className="text-muted-foreground">Largo</dt>
                <dd className="font-medium">{Number(product.boxLengthM).toFixed(3)} m</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Ancho</dt>
                <dd className="font-medium">{Number(product.boxWidthM).toFixed(3)} m</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Alto</dt>
                <dd className="font-medium">{Number(product.boxHeightM).toFixed(3)} m</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Descripción</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {product.description || 'Sin descripción adicional.'}
          </p>
          {product.tariffHeading?.description && (
            <p className="mt-3 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Partida arancelaria:</span> {product.tariffHeading.description}
            </p>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Productos relacionados</h2>
            <Link href="/products" className="text-xs font-medium text-primary hover:underline">
              Ver catálogo
            </Link>
          </div>
          {related.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((item) => (
                <RelatedProductCard key={item.id} product={item} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No hay productos relacionados disponibles.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Registro</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Creado</dt>
              <dd className="font-medium">{formatDate(product.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Actualizado</dt>
              <dd className="font-medium">{formatDate(product.updatedAt)}</dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  )
}
