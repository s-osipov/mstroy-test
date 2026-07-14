import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import TreeStoreGrid from '../TreeStoreGrid.vue'
import type { TreeGridRow } from '@/types/TreeGridRow'

const AgGridStub = {
  name: 'AgGridVue',
  props: [
    'rowData',
    'columnDefs',
    'autoGroupColumnDef',
    'treeData',
    'domLayout',
    'headerHeight',
    'rowHeight',
    'groupDefaultExpanded',
    'getDataPath',
    'defaultColDef',
  ],
  template: '<div class="ag-grid-stub" />',
}

function mountGrid() {
  const pinia = createPinia()
  setActivePinia(pinia)

  return mount(TreeStoreGrid, {
    global: {
      plugins: [pinia],
      stubs: {
        AgGridVue: AgGridStub,
      },
    },
  })
}

describe('TreeStoreGrid', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Рендер контейнера и таблицы', async () => {
    const wrapper = mountGrid()
    await flushPromises()

    expect(wrapper.find('section.tree-store-grid').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'AgGridVue' }).exists()).toBe(true)
  })

  it('Передача в таблицу пропсов tree-data, autoHeight, groupDefaultExpanded, headerHeight, rowHeight', async () => {
    const wrapper = mountGrid()
    await flushPromises()

    const grid = wrapper.findComponent({ name: 'AgGridVue' })

    expect(grid.props('treeData')).toBe(true)
    expect(grid.props('domLayout')).toBe('autoHeight')
    expect(grid.props('groupDefaultExpanded')).toBe(-1)
    expect(grid.props('headerHeight')).toBe(44)
    expect(grid.props('rowHeight')).toBe(44)
  })

  it('Получение строки по id', async () => {
    const wrapper = mountGrid()
    await flushPromises()

    const grid = wrapper.findComponent({ name: 'AgGridVue' })
    const getDataPath = grid.props('getDataPath') as (row: TreeGridRow) => string[]
    const rowData = grid.props('rowData') as TreeGridRow[]
    const item = rowData.find((row) => row.id === 4)

    expect(item).toBeDefined()
    expect(getDataPath(item!)).toEqual(['1', '91064cee', '4'])
  })
})
