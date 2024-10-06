import data from './data';

export const get = (collection) => data[collection];

export const add = (collection, item) => {
  data[collection].push(item);
  return item;
};

export const update = (collection, id, newItem) => {
  data[collection][id] = { ...data[collection][id], ...newItem };
  return data[collection][id];
};

export const deleteItem = (collection, id) => {
  data[collection].splice(id, 1);
  return data;
};
