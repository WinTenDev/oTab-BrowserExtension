<template>
  <div class="list-card relative overflow-hidden">
    <column-header :title="column.title" :labels="column.labels" :items="items" :columnId="column.id"></column-header>
    <column-tag :labels="column.labels"></column-tag>
    <div class="bg-gray-200 rounded-lg">
      <div class="px-3 py-2">
        <button-ui size="small" type="outline" @click="addItem('note')">
          <unicon name="file-plus" height="20" width="20"></unicon>
          <p class="inline-block text-sm">Add note</p>
        </button-ui>
        <button-ui size="small" type="outline" class="ml-2" @click="addItem('task')">
          <unicon name="clipboard-notes" height="20" width="20"></unicon>
          <p class="inline-block text-sm">Add task</p>
        </button-ui>
      </div>
      <scrollbar class="overflow-y-auto content pr-4 pl-3 pt-3 pb-4">
        <draggable v-model="items" group="list" ghost-class="hidden-child" style="min-height: 300px">
          <template v-for="item in filteredItems">
            <component class="mt-2 first:mt-0 cursor-pointer" :is="item.type" @update="updateItem" @delete="deleteItem" @edit="editItem" showUtil :data="item"></component>
          </template>
        </draggable>
      </scrollbar>
    </div>
    <transition name="slide" enter-active-class="slideInLeft" leave-active-class="slideOutLeft">
      <card-edit-task :columnId="column.id" :id="editTask.id" style="animation-duration: 0.5s" @close="editTask.active = false" v-if="editTask.active"></card-edit-task>
    </transition>
  </div>
</template>
<script>
import draggable from 'vuedraggable';
import scrollbar from 'vue-perfect-scrollbar';

import task from './Cards/CardTask.vue';
import note from './Cards/CardNote.vue';
import tab from './Cards/CardTab.vue';
import CardEditTask from './Cards/CardEditTask.vue';
import ColumnHeader from './ColumnHeader.vue';
import ColumnTag from './ColumnTag.vue';

export default {
  components: { task, note, tab, CardEditTask, draggable, ColumnHeader, ColumnTag, scrollbar },
  props: {
    column: {
      type: Object,
      default: () => ({
        title: '',
        id: '',
        labels: [],
      }),
    },
  },
  data: () => ({
    showLabel: false,
    editTask: {
      active: false,
      id: '',
    },
  }),
  methods: {
    editItem({ type, id }) {
      if (type === 'task') {
        this.editTask = {
          active: true,
          id,
        };
      } else if (type === 'note') {
        this.$router.push(`/note/${this.column.id}&${id}`);
      }
    },
    addItem(type) {
      this.$store.commit('items/addItem', {
        columnId: this.column.id,
        data: {
          type: type.toLowerCase(),
          title: '',
          content: '',
          done: type === 'task' ? false : undefined,
        },
      });
    },
    updateItem({ id, data }) {
      this.$store.dispatch('items/update', {
        columnId: this.column.id,
        id,
        data,
      });
    },
    deleteItem(id) {
      this.$store.dispatch('items/delete', {
        columnId: this.column.id,
        id,
      });
    },
  },
  computed: {
    items: {
      get() {
        return this.$store.getters['items/getItemsByColumnId'](this.column.id);
      },
      set(items) {
        this.$store.commit('changeItems', { columnId: this.column.id, items });
      },
    },
    filteredItems() {
      const { searchType, searchQuery } = this.$store.state.ui;

      return this.$store.getters['items/getItemsByColumnId'](this.column.id).filter(item => {
        if (searchType === 'column') return item;

        if (searchType === item.type) return item.title.toLowerCase().match(searchQuery);
      });
    },
  },
};
</script>
<style>
.list-card {
  width: 320px;
}
.list-card .content {
  width: 100%;
  min-height: 300px;
  max-height: calc(100vh - 13.5rem);
}
</style>
