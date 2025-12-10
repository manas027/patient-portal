// frontend/js/app.js
const API_BASE = 'http://localhost:5000/api/files';

const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const uploadStatus = document.getElementById('uploadStatus');
const filesTbody = document.getElementById('filesTbody');
const message = document.getElementById('message');

function humanFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

async function fetchFiles() {
    message.textContent = 'Loading...';
    filesTbody.innerHTML = '';
    try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        const files = data.files || [];
        if (files.length === 0) {
            filesTbody.innerHTML = `<tr><td class="empty" colspan="4">No files uploaded yet.</td></tr>`;
        } else {
            filesTbody.innerHTML = files.map(f => `
        <tr data-id="${f.id}">
          <td>${escapeHtml(f.name)}</td>
          <td>${humanFileSize(f.size)}</td>
          <td>${new Date(f.created_at).toLocaleString()}</td>
          <td>
            <button class="action-btn download" data-id="${f.id}">Download</button>
            <button class="action-btn delete" data-id="${f.id}">Delete</button>
          </td>
        </tr>
      `).join('');
        }
        message.textContent = '';
    } catch (err) {
        message.textContent = 'Could not load files.';
        console.error(err);
    }
}

function escapeHtml(unsafe) {
    return unsafe
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    uploadStatus.textContent = '';
    const file = fileInput.files[0];
    if (!file) {
        uploadStatus.textContent = 'Choose a PDF file first.';
        return;
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        uploadStatus.textContent = 'Only PDF files are allowed.';
        return;
    }

    uploadBtn.disabled = true;
    uploadStatus.textContent = 'Uploading...';

    const form = new FormData();
    form.append('file', file);

    try {
        const res = await fetch(API_BASE, { method: 'POST', body: form });
        const json = await res.json();
        if (!res.ok) {
            const err = json && json.error ? json.error : 'Upload failed';
            uploadStatus.textContent = err;
            console.error('Upload error', json);
        } else {
            uploadStatus.textContent = 'Upload successful.';
            fileInput.value = '';
            await fetchFiles();
            setTimeout(() => (uploadStatus.textContent = ''), 2000);
        }
    } catch (err) {
        uploadStatus.textContent = 'Upload error. See console.';
        console.error(err);
    } finally {
        uploadBtn.disabled = false;
    }
});

filesTbody.addEventListener('click', async (e) => {
    const el = e.target;
    const id = el.getAttribute('data-id');
    if (!id) return;

    if (el.classList.contains('download')) {
        // trigger browser download
        const url = `${API_BASE}/${id}/download`;
        // using anchor to honor filename
        const a = document.createElement('a');
        a.href = url;
        a.download = '';
        document.body.appendChild(a);
        a.click();
        a.remove();
    } else if (el.classList.contains('delete')) {
        if (!confirm('Delete this file?')) return;
        try {
            const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                alert((json && json.error) || 'Failed to delete');
            } else {
                await fetchFiles();
            }
        } catch (err) {
            alert('Delete failed — see console');
            console.error(err);
        }
    }
});

// initial load
fetchFiles();
