const permissions = {
  employee: {
    read: ['president', 'manager', 'leader'],
    create: ['president', 'manager'],
    update: ['president', 'manager'],
    delete: ['president'],
  },
  customer: {
    read: ['president', 'manager', 'leader', 'staff'],
    create: ['president', 'manager', 'leader', 'staff'],
    update: ['president', 'manager', 'leader'],
    delete: ['president', 'manager', 'leader'],
  },
};
module.exports = permissions;
