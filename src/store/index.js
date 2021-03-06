import Vue from 'vue';
import Vuex from 'vuex';

import modules from './modules';
import { getStorage, setStorage } from '~/utils/storage';

Vue.use(Vuex);

export default new Vuex.Store({
  namespaced: true,
  modules,
  mutations: {
    changeItems(state, { columnId, items }) {
      Vue.set(state.items, columnId, items);
      setStorage('items', state.items);
    },
    changeColumns(state, columns) {
      Vue.set(state.columns, state.ui.activeBoard, columns);
      setStorage('columns', state.columns);
    },
    changeModules(state, { key, value }) {
      const mainData = ['boards', 'columns', 'items', 'labels'];

      if (mainData.includes(key)) {
        Vue.set(state, key, value);
      } else {
        const assignData = Object.assign({}, state[key], value);
        Vue.set(state, key, assignData);
      }
    },
    overrideModule(state, { key, value }) {
      state[key] = value;
      setStorage(key, value);
    },
  },
  actions: {
    retrieveData({ commit }) {
      return new Promise(async resolve => {
        const data = await getStorage(['boards', 'columns', 'items', 'labels', 'settings', 'backup', 'user']);
        const boardsArr = Object.keys(data.boards);

        Object.keys(data).forEach(key => {
          commit('changeModules', {
            key,
            value: data[key],
          });
        });

        if (boardsArr.length === 0) return resolve(null);

        const { defaultBoard } = await getStorage('defaultBoard');
        commit('ui/setState', {
          defaultBoard,
          activeBoard: defaultBoard || boardsArr[0],
        });

        resolve({ ...data, defaultBoard });
      });
    },
    overrideLocalData({ commit }, data) {
      return new Promise(resolve => {
        Object.keys(data).forEach(key => {
          commit('overrideModule', {
            key,
            value: data[key],
          });
        });
      });
    },
  },
});
