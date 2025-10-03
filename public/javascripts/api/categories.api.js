const BASE_URL = '/admin/categories';

export async function addCategory({ name, description }) {
    const res = await fetch(`${BASE_URL}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
    });
    return res.json();
}

export async function editCategory(id, { name, description }) {
    const res = await fetch(`${BASE_URL}/edit/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
    });
    return res.json();
}

export async function deleteCategory(id) {
    const res = await fetch(`${BASE_URL}/delete/${id}`, {
        method: 'DELETE',
    });
    return res.json();
}

export async function updateCategoryStatus(id) {
    const res = await fetch(`${BASE_URL}/update-status/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
}
