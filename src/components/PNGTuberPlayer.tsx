'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

interface TrackFrame {
  quad: [number, number][]
  valid: boolean
}

interface TrackData {
  fps: number
  width: number
  height: number
  refSpriteSize: [number, number]
  calibration: {
    offset: [number, number]
    scale: number
    rotation: number
  }
  calibrationApplied: boolean
  frames: TrackFrame[]
}

type MouthState = 'closed' | 'half' | 'open' | 'e' | 'u'

interface PNGTuberPlayerProps {
  isTalking: boolean
  className?: string
}

export default function PNGTuberPlayer({ isTalking, className = '' }: PNGTuberPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const trackDataRef = useRef<TrackData | null>(null)
  const spritesRef = useRef<Record<MouthState, HTMLImageElement | null>>({
    closed: null,
    half: null,
    open: null,
    e: null,
    u: null,
  })
  const animationFrameRef = useRef<number | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const mouthStateRef = useRef<MouthState>('closed')
  const talkingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 口の状態をランダムに切り替え（話している時）
  const updateMouthState = useCallback(() => {
    if (isTalking) {
      const states: MouthState[] = ['open', 'half', 'e', 'u']
      mouthStateRef.current = states[Math.floor(Math.random() * states.length)]
    } else {
      mouthStateRef.current = 'closed'
    }
  }, [isTalking])

  // 話している時のアニメーション
  useEffect(() => {
    if (isTalking) {
      updateMouthState()
      talkingIntervalRef.current = setInterval(updateMouthState, 100)
    } else {
      if (talkingIntervalRef.current) {
        clearInterval(talkingIntervalRef.current)
        talkingIntervalRef.current = null
      }
      mouthStateRef.current = 'closed'
    }

    return () => {
      if (talkingIntervalRef.current) {
        clearInterval(talkingIntervalRef.current)
      }
    }
  }, [isTalking, updateMouthState])

  // 素材をロード
  useEffect(() => {
    const loadAssets = async () => {
      // 動画をロード
      const video = document.createElement('video')
      video.src = '/PNGTuber/yukyu.mp4'
      video.loop = true
      video.muted = true
      video.playsInline = true
      await video.play()
      videoRef.current = video

      // トラッキングデータをロード
      const trackResponse = await fetch('/PNGTuber/mouth_track.json')
      trackDataRef.current = await trackResponse.json()

      // 口スプライトをロード
      const mouthStates: MouthState[] = ['closed', 'half', 'open', 'e', 'u']
      await Promise.all(
        mouthStates.map(
          (state) =>
            new Promise<void>((resolve) => {
              const img = new Image()
              img.src = `/PNGTuber/mouth/${state}.png`
              img.onload = () => {
                spritesRef.current[state] = img
                resolve()
              }
              img.onerror = () => resolve()
            })
        )
      )

      setIsLoaded(true)
    }

    loadAssets()

    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.src = ''
      }
    }
  }, [])

  // レンダリングループ
  useEffect(() => {
    if (!isLoaded) return

    const render = () => {
      const canvas = canvasRef.current
      const video = videoRef.current
      const trackData = trackDataRef.current
      const ctx = canvas?.getContext('2d')

      if (!canvas || !video || !trackData || !ctx) {
        animationFrameRef.current = requestAnimationFrame(render)
        return
      }

      // キャンバスサイズを動画に合わせる
      if (canvas.width !== trackData.width || canvas.height !== trackData.height) {
        canvas.width = trackData.width
        canvas.height = trackData.height
      }

      // 動画フレームを描画
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // クロマキー処理：緑の背景を黒に変換
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        // 緑が強く、赤と青が弱い場合は緑の背景とみなす
        if (g > 100 && g > r * 1.2 && g > b * 1.2) {
          data[i] = 0     // R
          data[i + 1] = 0 // G
          data[i + 2] = 0 // B
        }
      }
      ctx.putImageData(imageData, 0, 0)

      // 現在のフレームインデックスを計算
      const frameIndex = Math.floor(video.currentTime * trackData.fps) % trackData.frames.length
      const frame = trackData.frames[frameIndex]

      if (frame && frame.valid) {
        // 口スプライトを取得
        const sprite = spritesRef.current[mouthStateRef.current]

        if (sprite) {
          // quadの4点から口の位置とサイズを計算
          const quad = frame.quad
          const centerX = (quad[0][0] + quad[1][0] + quad[2][0] + quad[3][0]) / 4
          const centerY = (quad[0][1] + quad[1][1] + quad[2][1] + quad[3][1]) / 4

          // 幅と高さを計算
          const width = Math.sqrt(
            Math.pow(quad[1][0] - quad[0][0], 2) + Math.pow(quad[1][1] - quad[0][1], 2)
          )
          const height = Math.sqrt(
            Math.pow(quad[3][0] - quad[0][0], 2) + Math.pow(quad[3][1] - quad[0][1], 2)
          )

          // 回転角度を計算
          const angle = Math.atan2(quad[1][1] - quad[0][1], quad[1][0] - quad[0][0])

          // キャリブレーションを適用
          const { offset, scale, rotation } = trackData.calibration
          const finalCenterX = centerX + offset[0]
          const finalCenterY = centerY + offset[1]
          const finalWidth = width * scale
          const finalHeight = height * scale
          const finalAngle = angle + (rotation * Math.PI) / 180

          // スプライトを描画
          ctx.save()
          ctx.translate(finalCenterX, finalCenterY)
          ctx.rotate(finalAngle)
          ctx.drawImage(sprite, -finalWidth / 2, -finalHeight / 2, finalWidth, finalHeight)
          ctx.restore()
        }
      }

      animationFrameRef.current = requestAnimationFrame(render)
    }

    animationFrameRef.current = requestAnimationFrame(render)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isLoaded])

  return (
    <div className={`relative ${className}`}>
      {/* CRTモニター風エフェクト */}
      <div className="relative overflow-hidden rounded-lg">
        {/* メインキャンバス */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
        />

        {/* スキャンライン */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.3) 2px, rgba(0, 0, 0, 0.3) 4px)',
          }}
        />

        {/* グリーンのオーバーレイ */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 50, 0, 0.3) 100%)',
          }}
        />

        {/* CRTの丸み・ビネット効果 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.5), inset 0 0 50px rgba(0, 50, 0, 0.3)',
          }}
        />

        {/* グロー効果 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: '0 0 20px rgba(74, 222, 128, 0.3), 0 0 40px rgba(74, 222, 128, 0.1)',
          }}
        />
      </div>

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
          <span className="text-green-400 animate-pulse font-mono">Loading...</span>
        </div>
      )}
    </div>
  )
}
