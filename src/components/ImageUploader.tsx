'use client'

import React, { useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from "@/components/ui/button"
import NextImage from 'next/image'
import { useDropzone } from 'react-dropzone'

interface ImageUploaderProps {
  onUpload: (url: string) => void
  currentImageUrl: string
}

export default function ImageUploader({ onUpload, currentImageUrl }: ImageUploaderProps) {
  const [image, setImage] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 100, x: 0, y: 0, height: 100 })
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null)
  const { session } = useAuth()

  // ドロップゾーンの設定
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    setImage(URL.createObjectURL(file))
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  })

  // 画像のトリミング処理
  const getCroppedImg = useCallback((image: HTMLImageElement, crop: Crop) => {
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    canvas.width = crop.width as number
    canvas.height = crop.height as number
    const ctx = canvas.getContext('2d')

    if (ctx) {
      ctx.drawImage(
        image,
        (crop.x as number) * scaleX,
        (crop.y as number) * scaleY,
        (crop.width as number) * scaleX,
        (crop.height as number) * scaleY,
        0,
        0,
        crop.width as number,
        crop.height as number
      )
    }

    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
      }, 'image/jpeg')
    })
  }, [])

  // トリミング完了時の処理
  const handleCropComplete = useCallback(async (crop: Crop) => {
    if (image) {
      const img = new Image()
      img.src = image
      img.onload = async () => {
        const croppedImageBlob = await getCroppedImg(img, crop)
        setCroppedImageUrl(URL.createObjectURL(croppedImageBlob))
      }
    }
  }, [image, getCroppedImg])

  // 画像のアップロード処理
  const uploadImage = async () => {
    if (!croppedImageUrl || !session) return

    const res = await fetch(croppedImageUrl)
    const blob = await res.blob()
    const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' })

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(`${session.user.id}/profile.jpg`, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      console.error('Error uploading image:', error)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(`${session.user.id}/profile.jpg`)

    onUpload(publicUrl)
  }
  console.log(croppedImageUrl)

  return (
    <div className="space-y-4">
      {/* 現在の画像プレビュー */}
      {currentImageUrl && !image && (
        <div>
          <h3 className="text-lg font-semibold mb-2">現在のプロフィール画像</h3>
          <img src={currentImageUrl} alt="Current profile" className="max-w-xs mx-auto rounded-full" />
        </div>
      )}

      {/* 画像ドロップゾーン */}
      <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer">
        <input {...getInputProps()} />
        <p>画像をドラッグ＆ドロップするか、クリックして選択してください</p>
      </div>

      {/* 画像トリミングエリア */}
      {image && (
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={handleCropComplete}
          aspect={1}
        >
          <img src={image} alt="Upload" />
        </ReactCrop>
      )}

      {/* トリミングされた画像のプレビュー */}
      {croppedImageUrl && (
        <div>
          <h3 className="text-lg font-semibold mb-2">プレビュー</h3>
          <img src={croppedImageUrl} alt="Cropped" className="max-w-xs mx-auto rounded-full" />
        </div>
      )}

      {/* アップロードボタン */}
      {croppedImageUrl && (
        <Button onClick={uploadImage}>画像をアップロード</Button>
      )}
    </div>
  )

}