import { defineStore } from 'pinia';
import type { Item } from '../types/Item';

type ItemId = Item['id'];
type ParentId = Item['parent'];

export const useTreeStore = defineStore('tree', {
    state: () => ({
        items: [] as Item[],
        itemById: new Map<ItemId, Item>(),
        childrenByParent: new Map<ParentId, Item[]>(),
    }),
    actions: {
        setItems(items: Item[]) {
            this.items = items;
            this.rebuildIndexes();
        },

        rebuildIndexes() {
            this.itemById.clear();
            this.childrenByParent.clear();

            for (const item of this.items) {
                this.indexItem(item);
            }
        },

        indexItem(item: Item) {
            this.itemById.set(item.id, item);

            const siblings = this.childrenByParent.get(item.parent);
            if (siblings) {
                siblings.push(item);
            } else {
                this.childrenByParent.set(item.parent, [item]);
            }
        },

        unindexItem(item: Item) {
            this.itemById.delete(item.id);
            this.childrenByParent.delete(item.id);

            const siblings = this.childrenByParent.get(item.parent);
            if (!siblings) return;

            const index = siblings.findIndex((sibling) => sibling.id === item.id);
            if (index !== -1) {
                siblings.splice(index, 1);
            }
        },

        moveItemInChildrenIndex(item: Item, oldParent: ParentId) {
            const oldSiblings = this.childrenByParent.get(oldParent);
            if (oldSiblings) {
                const index = oldSiblings.findIndex((sibling) => sibling.id === item.id);
                if (index !== -1) {
                    oldSiblings.splice(index, 1);
                }
            }

            const newSiblings = this.childrenByParent.get(item.parent);
            if (newSiblings) {
                newSiblings.push(item);
            } else {
                this.childrenByParent.set(item.parent, [item]);
            }
        },

        getAll(): Item[] {
            return this.items;
        },

        getItem(id: ItemId): Item | undefined {
            return this.itemById.get(id);
        },

        getChildren(id: ItemId): Item[] {
            return this.childrenByParent.get(id) ?? [];
        },

        getAllChildren(id: ItemId): Item[] {
            const result: Item[] = [];
            const stack = this.getChildren(id).slice();

            while (stack.length > 0) {
                const current = stack.pop();
                if (!current) break;

                result.push(current);

                const children = this.getChildren(current.id);
                for (const child of children) {
                    stack.push(child);
                }
            }

            return result;
        },

        getAllParents(id: ItemId): Item[] {
            const result: Item[] = [];
            let current = this.getItem(id);

            while (current) {
                result.push(current);
                current = current.parent === null ? undefined : this.getItem(current.parent);
            }

            return result;
        },

        addItem(item: Item): Item {
            this.items.push(item);
            this.indexItem(item);
            return item;
        },

        removeItem(id: ItemId): void {
            const idsToRemove = new Set<ItemId>();
            const queue: ItemId[] = [id];
            let head = 0;

            while (head < queue.length) {
                const currentId = queue[head];
                head += 1;
                if (currentId === undefined) continue;

                if (idsToRemove.has(currentId)) continue;

                const item = this.itemById.get(currentId);
                if (!item) continue;

                idsToRemove.add(currentId);

                const children = this.getChildren(currentId);
                for (const child of children) {
                    queue.push(child.id);
                }
            }

            for (const removedId of idsToRemove) {
                const item = this.itemById.get(removedId);
                if (item) {
                    this.unindexItem(item);
                }
            }

            this.items = this.items.filter((item) => !idsToRemove.has(item.id));
        },

        updateItem(updatedItem: Item): Item | undefined {
            const existing = this.itemById.get(updatedItem.id);
            if (!existing) return undefined;

            if (existing.parent !== updatedItem.parent) {
                const oldParent = existing.parent;
                existing.parent = updatedItem.parent;
                this.moveItemInChildrenIndex(existing, oldParent);
            }

            existing.label = updatedItem.label;
            return existing;
        },
    },
});
