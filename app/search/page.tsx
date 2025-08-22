import { Metadata } from 'next'
import NeoBrutalistSearchClient from './NeoBrutalistSearchClient'

export const metadata: Metadata = {
  title: 'FIND MUSICIANS | BANDSEEKING',
  description: 'Find musicians near you. No BS.',
}

export default function SearchPage() {
  return <NeoBrutalistSearchClient />
}