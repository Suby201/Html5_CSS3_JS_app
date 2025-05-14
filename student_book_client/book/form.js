const API_BASE_URL = "http://localhost:8080";
const studentForm = document.getElementById("bookForm");
const studentTableBody = document.getElementById("bookTableBody");

document.addEventListener("DOMContentLoaded", function () {
  LoadBook();
});

bookForm.addEventListener("submit", function (event) {
  event.preventDefault();
  console.log("Form 제출 됨");

  const bookFormData = new FormData(bookForm);
  bookFormData.forEach((value, key) => {
    console.log(key + " = " + value);
  });

  const bookData = {
    title: bookFormData.get("title").trim(),
    author: bookFormData.get("author").trim(),
    ISBN: bookFormData.get("isbn").trim(),
    price: bookFormData.get("price").trim(),
    publishDate: bookFormData.get("publishDate").trim(),
    description: bookFormData.get("description").trim(),
    language: bookFormData.get("language").trim(),
    pageCount: bookFormData.get("pageCount").trim(),
    publisher: bookFormData.get("publisher").trim(),
    edition: bookFormData.get("edition"),
  };

  if (!validateBook(bookData)){
    return;
  }
});

function validateBook(book){
    if(!book.title){
        alert("제목을 입력해주세요.");
        return false;
    }

    if(!book.author){
        alert("글쓴이을 입력해주세요.");
        return false;
    }

    if(!book.isbn){
        alert("ISBN을 입력해주세요.");
        return false;
    }

    if(!book.price){
        alert("가격을 입력해주세요.");
        return false;
    }

    if(!book.publishDate){
        alert("출판일을 입력해주세요.");
        return false;
    }

    if(!book.description){
        alert("요약을 입력해주세요.");
        return false;
    }

    if(!book.language){
        alert("언어를 입력해주세요.");
        return false;
    }

    if(!book.pageCount){
        alert("쪽 수를 입력해주세요.");
        return false;
    }

    if(!book.publisher){
        alert("출판사를 입력해주세요.");
        return false;
    }

    if(!book.edition){
        alert("판을 입력해주세요.");
        return false;
    }
}

function LoadBook() {
  console.log("책 목록 로드 중.....");
}
