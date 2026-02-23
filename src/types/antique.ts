export interface Antique {
  id: string
  name: string
  height: number | null
  diameter_mouth: number | null
  diameter_bottom: number | null
  origin: string | null
  purchase_price: number | null
  reference_notes: string | null
  reference_link: string | null
  image_urls: string[]
  created_at?: string
}

export type AntiqueListItem = Pick<
  Antique,
  'id' | 'name' | 'image_urls' | 'created_at'
>
