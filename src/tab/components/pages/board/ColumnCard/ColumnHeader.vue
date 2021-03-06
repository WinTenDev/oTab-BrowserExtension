<template>
  <div class="header flex items-center mb-1 cursor-move">
    <input-ui
      v-if="editColumn.active"
      autofocus
      class="text-sm"
      v-model="editColumn.title"
      @keyup.enter="updateColumnTitle"
      @blur="updateColumnTitle"
      style="padding: 3px"
    ></input-ui>
    <p class="text-sm cursor-pointer text-overflow font-medium py-1 rounded-lg px-2 hover:bg-gray-200" @click="editColumn = { active: true, title }" v-else style="max-width: 75%">
      {{ title }}
    </p>
    <div class="flex-grow"></div>
    <v-popover placement="bottom-start" open-group="label">
      <button-icon icon="ellipsis-v" small v-close-popover.all></button-icon>
      <template slot="popover">
        <card-ui class="shadow-xl text-default">
          <list-ui icon="trash" class="text-red" small v-close-popover @click="deleteColumn">
            Delete column
          </list-ui>
          <label-ui v-model="columnLabels" placement="right" :show="showLabel">
            <list-ui icon="label-alt" small style="width: 220px" class="mt-1" @click="showLabel = true">
              Labels
            </list-ui>
          </label-ui>
          <hr class="my-2" />
          <list-ui icon="check" small v-close-popover @click="deleteCompleteTask">
            Delete completed tasks
          </list-ui>
          <list-ui icon="arrow-up-right" small class="mt-1" v-close-popover @click="openAllTabs">
            Open all tabs
          </list-ui>
        </card-ui>
      </template>
    </v-popover>
  </div>
</template>
<script>
export default {
  props: {
    title: String,
    columnId: String,
    labels: Array,
    items: Array,
  },
  data: () => ({
    editColumn: {
      active: false,
      title: '',
    },
    showLabel: false,
  }),
  computed: {
    columnLabels: {
      get() {
        return this.labels;
      },
      set(value) {
        this.$store.dispatch('columns/update', {
          id: this.columnId,
          data: {
            labels: value,
          },
        });
      },
    },
  },
  methods: {
    deleteCompleteTask() {
      const taskIds = this.items.filter(item => item.type === 'task' && item.done).map(item => item.id);

      this.$store.dispatch('items/delete', {
        columnId: this.columnId,
        id: taskIds,
      });
    },
    updateColumnTitle() {
      if (this.editColumn.title === '') return;
      this.$store.dispatch('columns/update', {
        id: this.columnId,
        data: {
          title: this.editColumn.title,
        },
      });
      this.editColumn.active = false;
    },
    openAllTabs() {
      this.items
        .filter(item => item.type === 'tab')
        .forEach(tab => {
          this.$browser.tabs.create({
            url: tab.url,
          });
        });
    },
    deleteColumn() {
      this.$modal.show('delete', {
        title: 'Delete column',
        text: this.title,
        handler: confirm => {
          if (confirm) this.$store.dispatch('columns/delete', this.columnId);
        },
      });
    },
  },
};
</script>
<style>
.select-label .unicon.selected {
  transform: translateY(0);
}
.select-label .unicon {
  transition: all 0.2s ease;
  transform: translateY(30px);
}
.select-label:hover .unicon {
  transform: translateY(0);
}
.select-label {
  overflow: hidden;
  cursor: pointer;
}
.select-label:hover {
  filter: brightness(1.1);
}
</style>
