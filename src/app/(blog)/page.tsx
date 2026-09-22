import { HeroImage } from '@/components/hero-image'

export const metadata = {
  title: 'yukyu.net',
  description: '個人的な覚え書き'
}

export default function Home() {
  return (
    <div className="page">
      <HeroImage />
    </div>
  )
}
