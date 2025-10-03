module.exports = {
  eq: (a, b) => a === b,
  not: (v) => !v,
  and: (a, b) => a && b,
  or: (a, b) => a || b,
  gt: (a, b) => a > b,
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  },
  paginationPages: (totalPages, currentPage) => {
    const pages = [];
    const delta = 2;
    const range = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift('...');
    }

    if (currentPage + delta < totalPages - 1) {
      range.push('...');
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    for (const page of range) {
      pages.push({
        page,
        active: page === currentPage,
        isEllipsis: page === '...'
      });
    }

    return pages;
  },
};
