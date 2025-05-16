b// 전역 변수
const API_BASE_URL = 'http://localhost:8080';
let editingBookId = null;

// DOM 요소 참조
const bookForm = document.getElementById('bookForm');
const bookTableBody = document.getElementById('bookTableBody');
const cancelButton = bookForm.querySelector(".cancel-btn");
const submitButton = bookForm.querySelector('button[type="submit"]');
const formError = document.getElementById("formerror");

// 초기화
document.addEventListener('DOMContentLoaded', function () {
    console.log('페이지 로드 완료');
    loadBooks();
});

// 폼 제출 이벤트 핸들러
bookForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // 폼 데이터 수집
    const formData = new FormData(bookForm);
    const bookData = {
        title: formData.get('title').trim(),
        author: formData.get('author').trim(),
        isbn: formData.get('isbn').trim(),
        price: formData.get('price') ? parseInt(formData.get('price')) : null,
        publishDate: formData.get('publishDate') || null,
        detailRequest: {
            description: formData.get('description')||null,
            language: formData.get('language').trim(),
            pageCount: formData.get('pageCount') ? parseInt(formData.get('pageCount')) : null,
            publisher: formData.get('publisher').trim(),
            coverImageUrl: formData.get('coverImageUrl').trim(),
            edition: formData.get('edition').trim()
        }
    };

    // 유효성 검사
    if (!validateBook(bookData)) {
        return;
    }

    if(editingBookId){
        updateBook(bookData,editingBookId);
    }else{
        createBook(bookData);
    }

});

function renderBookTable(books){
    console.log(books);
    bookTableBody.innerHTML = "";

    books.forEach((book) => {
        const row = document.createElement("tr");
        row.innerHTML=`
                        <td>${book.title}</td>
                        <td>${book.author}</td>
                        <td>${book.isbn}</td>
                        <td>${book.price || "-"}</td>
                        <td>${book.publishDate || "-"}</td>
                        <td>${book.detail?.language ?? "-"}</td>
                        <td>${book.detail?.pageCount || "-"}</td>
                        <td>${book.detail?.publisher ?? "-"}</td>
                        <td>${book.detail?.coverImageUrl ?? "-"}</td>
                        <td>${book.detail?.edition ?? "-"}</td>
                        <td>${book.detail?.description ?? "-"}</td>
                        <td>
                            <button class="edit-btn" onlick="editBook(${book.id})">수정</button>
                            <button class="delete-btn" onclick="deleteBook(${book.id})>삭제</button>
                        </td>
                    `;
        bookTableBody.appendChild(row);
    });
}

function editBook(bookId){
    fetch(`${API_BASE_URL}/api/books/${bookId}`)
    .then(async(response)=>{
        if(!response.ok){
            const errorData = await response.json();
            if(response.status===409){
                throw new Error(errorData.message || "존재하지 않는 도서입니다.");
            }
        }
        return response.json();
    })
    .then((book) => {
        bookForm.title.value = book.title;
        bookForm.author.value = book.author;
        bookForm.isbn.value = book.isbn;
        bookForm.price.value = book.price;
        bookForm.publishDate.value = book.publishDate;
        if(book.detail){
            bookForm.language.value = book.detail.language;
            bookForm.pageCount.value = book.detail.pageCount;
            bookForm.publisher.value = book.detail.publisher;
            bookForm.edition.value = book.detail.edition;
            bookForm.coverImageUrl.value = book.detail.coverImageUrl;
            bookForm.description.value = book.detail.description;
        }
        editingBookId = bookId;
        submitButton.textContent = "도서 수정";
        cancelButton.style.display = "inline-block";
    })
    .catch((error) => {
        console.log("Error: ",error);
        showError(error.message);
    });
}

function deleteBook(bookId){
    if(!confirm(`ID = ${bookId}인 도서를 정말로 삭제하시겠습니까?`)){
        return;
    }
    console.log("삭제처리...");
    fetch(`${API_BASE_URL}/api/books/${bookId}`,{
        method: "DELETE",
    })
    .then(async (response) => {
        if(!response.ok){
            const errorData = await response.json();
            if(response.status === 409){
                throw new Error(errorData.message || "존재하지 않는 도서입니다.");
            } else {
                throw new Error(errorData.message || "도서 삭제에 실패했습니다.");
            }
        }
        showSuccess("도서가 성공적으로 삭제되었습니다.");
        loadBooks();
    })
    .catch((error) => {
        console.log("Error: ",error);
        showError(error.message);
    });
}

function updateBook(bookData,bookId){
    fetch(`${API_BASE_URL}/api/books/${bookId}`,{
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(bookData),
    })
    .then(async (response) =>{
        if(!response.ok){
            const errorData = await response.json();
            if(response.status === 409){
                throw new Error(errorData.message || "중복되는 정보가 있습니다.");
            } else {
                throw new Error(errorData.message || "도서 수정에 실패했습니다.");
            }
        }
        return response.json();
    })
    .then((result) => {
        console.log("Error: " , error);
        showError(error.message);
    });
}

function createBook(bookData){
    fetch(`${API_BASE_URL}/api/books`,{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(bookData),
    })
    .then(async (response) => {
        if (!response.ok){
            const errorData = await response.json();
            if(response.status === 409){
                throw new Error(errorData.message || "중복되는 정보가 있습니다.")
            } else {
                throw new Error(errorData.message || "도서 등록에 실패했습니다.");
            }
        }
        return response.json();
    })
    .then((result) => {
        showSuccess("학생이 성공적으로 등록되었습니다.")
        resetForm();
        loadBooks();
    })
    .catch((error) => {
        console.log("Error: ",error);
        showError(error.message);
    });
}
// 도서 데이터 유효성 검사
function validateBook(book) {
    // 필수 필드 검사
    if (!book.title) {
        alert('제목을 입력해주세요.');
        return false;
    }

    if (!book.author) {
        alert('저자를 입력해주세요.');
        return false;
    }

    if (!book.isbn) {
        alert('ISBN을 입력해주세요.');
        return false;
    }

    // ISBN 형식 검사 (기본적인 영숫자 조합)
    const isbnPattern = /^[0-9X-]+$/;
    if (!isbnPattern.test(book.isbn)) {
        alert('올바른 ISBN 형식이 아닙니다. (숫자와 X, -만 허용)');
        return false;
    }

    // 가격 유효성 검사
    if (book.price !== null && book.price < 0) {
        alert('가격은 0 이상이어야 합니다.');
        return false;
    }

    // 페이지 수 유효성 검사
    if (book.bookDetail.pageCount !== null && book.bookDetail.pageCount < 0) {
        alert('페이지 수는 0 이상이어야 합니다.');
        return false;
    }

    // URL 형식 검사 (입력된 경우에만)
    if (book.bookDetail.coverImageUrl && !isValidUrl(book.bookDetail.coverImageUrl)) {
        alert('올바른 이미지 URL 형식이 아닙니다.');
        return false;
    }

    return true;
}

// URL 유효성 검사
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// 도서 목록 로드 함수
function loadBooks() {
    console.log('도서 목록 로드 중...');
    fetch(`${API_BASE_URL}/api/books`)
    .then((response)=>{
        if(!response.ok){
            throw new Error("도서 목록을 불러오는데 실패했습니다.");
        }
        return response.json();
    })
    .then ((books)=> renderBookTable(books))
    .catch((error)=>{
        console.log("Error: ",error);
        showError("도서 목록을 불러오는데 실패했습니다.");
        bookTableBody.innerHTML=`
                <tr>
                    <td colspan="7" style="text-align: center; color: #dc3545;">
                        오류: 데이터를 불러올 수 없습니다.
                    </td>
                </tr>
        `;
    });
}

function resetForm() {
  bookForm.reset();
  editingBookId = null;
  submitButton.textContent = "도서 등록";
  cancelButton.style.display = "none";
  clearMessages();
}

function showSuccess(message) {
    formError.textContent = message;
    formError.style.display = 'block';
    formError.style.color = '#28a745';
}
//에러 메시지 출력
function showError(message) {
    formError.textContent = message;
    formError.style.display = 'block';
    formError.style.color = '#dc3545';
}
//메시지 초기화
function clearMessages() {
    formError.style.display = 'none';
}