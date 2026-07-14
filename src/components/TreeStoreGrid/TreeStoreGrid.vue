<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import type {
  ColDef,
  GetDataPath,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
} from 'ag-grid-community'
import { useTreeStore } from '@/stores/TreeStore'
import { itemsData, TEXTS } from '@/constants'
import type { Item } from '@/types/item'
import {
  buildTreeGridRows,
  getDisplayedRowNumber,
  type TreeGridRow,
} from '@/utils/treeGrid'

const treeStore = useTreeStore()
const gridApi = shallowRef<GridApi<TreeGridRow> | null>(null)

const HEADER_HEIGHT = 44
const ROW_HEIGHT = 44

const rowData = computed(() => buildTreeGridRows(treeStore))

const getDataPath: GetDataPath<TreeGridRow> = (data) => data.path

function categoryInnerRenderer(params: ICellRendererParams<TreeGridRow>) {
  const span = document.createElement('span')
  span.textContent = params.value ?? ''
  if (params.data?.category === TEXTS.categoryGroup) {
    span.className = 'tree-store-grid__group-label'
  }
  return span
}

const autoGroupColumnDef = ref<ColDef<TreeGridRow>>({
  colId: 'category',
  headerName: TEXTS.columnCategory,
  field: 'category',
  minWidth: 400,
  editable: false,
  sortable: false,
  filter: false,
  cellRendererParams: {
    suppressCount: true,
    innerRenderer: categoryInnerRenderer,
  },
  cellClass: 'tree-store-grid__category',
  cellClassRules: {
    'tree-store-grid__category-item': (params) =>
      params.data?.category === TEXTS.categoryItem,
  },
})

const columnDefs = ref<ColDef<TreeGridRow>[]>([
  {
    headerName: TEXTS.columnRowNum,
    colId: 'rowNum',
    maxWidth: 90,
    pinned: 'left',
    lockPosition: 'left',
    suppressMovable: true,
    sortable: false,
    filter: false,
    editable: false,
    cellClass: 'tree-store-grid__row-num',
    valueGetter: (params) => {
      if (!params.api || !params.node) return ''
      return getDisplayedRowNumber(params.api, params.node)
    },
  },
  {
    headerName: TEXTS.columnLabel,
    colId: 'label',
    field: 'label',
    flex: 1,
    minWidth: 400,
    editable: false,
    sortable: false,
    filter: false,
    cellClassRules: {
      'tree-store-grid__group-label': (params) =>
        params.data?.category === TEXTS.categoryGroup,
    },
  },
])

function onGridReady(event: GridReadyEvent<TreeGridRow>) {
  gridApi.value = event.api
}

onMounted(() => {
  if (treeStore.getAll().length === 0) {
    treeStore.setItems(itemsData as Item[])
  }
})
</script>

<template>
  <section class="tree-store-grid">
    <header class="tree-store-grid__toolbar">
    </header>

    <AgGridVue
      class="tree-store-grid__table"
      dom-layout="autoHeight"
      :row-data="rowData"
      :column-defs="columnDefs"
      :default-col-def="{
        resizable: false,
        suppressHeaderMenuButton: true,
        suppressHeaderContextMenu: true,
        suppressHeaderFilterButton: true,
      }"
      :tree-data="true"
      :get-data-path="getDataPath"
      :auto-group-column-def="autoGroupColumnDef"
      :group-default-expanded="-1"
      :header-height="HEADER_HEIGHT"
      :row-height="ROW_HEIGHT"
      :suppress-cell-focus="true"
      :locale-text="{ noRowsToShow: TEXTS.noRowsToShow }"
      row-selection="single"
      animate-rows
      @grid-ready="onGridReady"
    />
  </section>
</template>

<style scoped lang="scss" src="./TreeStoreGrid.scss"></style>
