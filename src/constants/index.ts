import items from './items.json'
import texts from './texts.json'

export const itemsData = items
export const TEXTS = texts

export type ItemCategory = typeof TEXTS.categoryGroup | typeof TEXTS.categoryItem
