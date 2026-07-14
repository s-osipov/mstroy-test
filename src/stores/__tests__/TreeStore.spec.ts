import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useTreeStore } from '../TreeStore'
import type { Item } from '@/types/Item'

const sampleItems: Item[] = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cee', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cee', label: 'Айтем 4' },
  { id: 5, parent: '91064cee', label: 'Айтем 5' },
  { id: 6, parent: '91064cee', label: 'Айтем 6' },
  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' },
]

function createSampleItems(): Item[] {
  return sampleItems.map((item) => ({ ...item }))
}

describe('TreeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Инициализация пустым списком', () => {
    const store = useTreeStore()

    expect(store.getAll()).toEqual([])
    expect(store.getItem(1)).toBeUndefined()
    expect(store.getChildren(1)).toEqual([])
  })

  it('Сохранение элементов', () => {
    const store = useTreeStore()

    store.setItems(createSampleItems())

    expect(store.getAll()).toHaveLength(8)
    expect(store.getItem(1)?.label).toBe('Айтем 1')
    expect(store.getItem('91064cee')?.label).toBe('Айтем 2')
    expect(store.getChildren(1).map((item) => item.id)).toEqual(['91064cee', 3])
    expect(store.getChildren('91064cee').map((item) => item.id)).toEqual([4, 5, 6])
    expect(store.getChildren(4).map((item) => item.id)).toEqual([7, 8])
  })

  it('Получение дочерних элементов', () => {
    const store = useTreeStore()
    store.setItems(createSampleItems())

    const ids = store.getAllChildren(1).map((item) => item.id)

    expect(ids).toHaveLength(7)
    expect(ids).toEqual(expect.arrayContaining(['91064cee', 3, 4, 5, 6, 7, 8]))
    expect(store.getAllChildren(3)).toEqual([])
  })

  it('Получение родительских элементов', () => {
    const store = useTreeStore()
    store.setItems(createSampleItems())

    expect(store.getAllParents(7).map((item) => item.id)).toEqual([
      7,
      4,
      '91064cee',
      1,
    ])
    expect(store.getAllParents(1).map((item) => item.id)).toEqual([1])
    expect(store.getAllParents(999)).toEqual([])
  })

  it('Добавление элемента', () => {
    const store = useTreeStore()
    store.setItems(createSampleItems())

    const created = store.addItem({ id: 9, parent: 3, label: 'Айтем 9' })

    expect(created.id).toBe(9)
    expect(store.getAll()).toHaveLength(9)
    expect(store.getItem(9)?.label).toBe('Айтем 9')
    expect(store.getChildren(3).map((item) => item.id)).toEqual([9])
  })

  it('Удаление элемента', () => {
    const store = useTreeStore()
    store.setItems(createSampleItems())

    store.removeItem('91064cee')

    expect(store.getAll().map((item) => item.id)).toEqual([1, 3])
    expect(store.getItem('91064cee')).toBeUndefined()
    expect(store.getItem(4)).toBeUndefined()
    expect(store.getItem(7)).toBeUndefined()
    expect(store.getChildren(1).map((item) => item.id)).toEqual([3])
  })

  it('Удаление элемента для отсутствующего id', () => {
    const store = useTreeStore()
    store.setItems(createSampleItems())

    store.removeItem(999)

    expect(store.getAll()).toHaveLength(8)
  })

  it('Обновление элемента', () => {
    const store = useTreeStore()
    store.setItems(createSampleItems())

    const updated = store.updateItem({
      id: 3,
      parent: 1,
      label: 'Обновлённый',
    })

    expect(updated?.label).toBe('Обновлённый')
    expect(store.getItem(3)?.label).toBe('Обновлённый')
    expect(store.getChildren(1).map((item) => item.id)).toEqual(['91064cee', 3])
  })

  it('Перенос элемента к другому родителю', () => {
    const store = useTreeStore()
    store.setItems(createSampleItems())

    const updated = store.updateItem({
      id: 5,
      parent: 3,
      label: 'Айтем 5',
    })

    expect(updated?.parent).toBe(3)
    expect(store.getItem(5)?.parent).toBe(3)
    expect(store.getChildren('91064cee').map((item) => item.id)).toEqual([4, 6])
    expect(store.getChildren(3).map((item) => item.id)).toEqual([5])
  })

  it('Обновление элемента для отсутствующего id', () => {
    const store = useTreeStore()
    store.setItems(createSampleItems())

    expect(
      store.updateItem({ id: 999, parent: null, label: 'Нет' }),
    ).toBeUndefined()
  })
})
