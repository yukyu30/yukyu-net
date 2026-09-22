import { permanentRedirect } from 'next/navigation'

export default function MePage() {
  permanentRedirect('/about')
}
