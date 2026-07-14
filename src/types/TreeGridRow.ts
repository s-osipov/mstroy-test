import type { Item } from './Item'
import type { ItemCategory } from '@/constants'

export interface TreeGridRow {
    id: Item['id']
    label: string
    category: ItemCategory
    path: string[]
  }