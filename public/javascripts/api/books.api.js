const BASE_URL = '/admin/books';

export async function addBook(formData) {
    const res = await fetch(`${BASE_URL}/add`, {
        method: 'POST',
        body: formData,
    });
    return res.json();
}

export async function editBook(id, formData) {
    const res = await fetch(`${BASE_URL}/edit/${id}`, {
        method: 'PUT',
        body: formData
    });
    return res.json();
}

export async function deleteBook(id) {
    const res = await fetch(`${BASE_URL}/delete/${id}`, {
        method: 'DELETE',
    });
    return res.json();
}

export async function updateBookStatus(id) {
    const res = await fetch(`${BASE_URL}/update-status/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
}

export async function getBookById(id) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return res.json();
}
