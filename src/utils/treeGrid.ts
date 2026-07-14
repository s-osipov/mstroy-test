import type { GridApi, IRowNode } from 'ag-grid-community'
import { TEXTS } from '@/constants'
import type { Item } from '@/types/Item'
import type { TreeGridRow } from '@/types/TreeGridRow'

type Store = {
  getAll(): Item[]
  getChildren(id: Item['id']): Item[]
  getItem(id: Item['id']): Item | undefined
}

function buildPathById(store: Store): Map<Item['id'], string[]> {
  const pathById = new Map<Item['id'], string[]>()

  function getPath(id: Item['id']): string[] {
    const cached = pathById.get(id)
    if (cached) return cached

    const item = store.getItem(id)
    if (!item) return []

    const path =
      item.parent === null
        ? [String(item.id)]
        : [...getPath(item.parent), String(item.id)]

    pathById.set(id, path)
    return path
  }

  for (const item of store.getAll()) {
    getPath(item.id)
  }

  return pathById
}

export function buildTreeGridRows(store: Store): TreeGridRow[] {
  const pathById = buildPathById(store)

  return store.getAll().map((item) => ({
    id: item.id,
    label: item.label,
    category:
      store.getChildren(item.id).length > 0
        ? TEXTS.categoryGroup
        : TEXTS.categoryItem,
    path: pathById.get(item.id) ?? [String(item.id)],
  }))
}

export function getDisplayedRowNumber(api: GridApi, node: IRowNode): number {
  let result = 0
  let index = 0

  api.forEachNodeAfterFilterAndSort((currentNode) => {
    index += 1
    if (currentNode === node) {
      result = index
    }
  })

  return result
}
