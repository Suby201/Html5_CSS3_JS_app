//전역변수
const API_BASE_URL = "http://localhost:8080";

//DOM 엘리먼트 가져오기
const studentForm = document.getElementById("studentForm");
const studentTableBody = document.getElementById("studentTableBody");

//Document Load 이벤트 처리하기
document.addEventListener("DOMContentLoaded", function () {
  loadStudents();
});

//Form Submit 이벤트 처리하기
studentForm.addEventListener("submit", function (event) {
  //기본으로 설정된 Event가 동작하지 않도록 하기 위함
  event.preventDefault();
  console.log("Form 제출 되었음...");

  //FormData 객체생성 <form>엘리먼트를 객체로 변환
  const stuFormData = new FormData(studentForm);
  stuFormData.forEach((value, key) => {
    console.log(key + " = " + value);
  });

  //사용자 정의 Student 객체생성 ( 공백 제거 )
  const studentData = {
    name: stuFormData.get("name").trim(),
    studentNumber: stuFormData.get("studentNumber").trim(),
    detailRequest: {
      address: stuFormData.get("address").trim(),
      phoneNumber: stuFormData.get("phoneNumber").trim(),
      email: stuFormData.get("email").trim(),
      dateOfBirth: stuFormData.get("dateOfBirth") || null,
    },
  };

  //유효성 체크하기
  if (!validateStudent(studentData)) {
    //검증체크 실패하면 리턴하기
    return;
  }

  creadteStudent(studentData);
});

function creadteStudent(studentData){
    fetch(`${API_BASE_URL}/api/students`,{
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(studentData)
    })
    .then(async(response) => {
        if(!response.ok){
            const errData = await response.json();
            if(response.status === 409){
                throw new Error(errData.message || '중복되는 정보가 있습니다.');
            } else {
                throw new Error(errData.message || '학생 등록에 실패했습니다.');
            }
        }
        return response.json();
    })
    .then((result)=>{
        alert("학생이 성공적으로 등록되었습니다.");
        studentForm.reset();
        loadStudents();
    })
    .catch(()=>{
        console.log('Error: ',error);
        alert(error.message);
    })
}

//데이터 유효성을 체크하는 함수
function validateStudent(student) {
  // 필수 필드 검사
  if (!student.name) {
    alert("이름을 입력해주세요.");
    return false;
  }

  if (!student.studentNumber) {
    alert("학번을 입력해주세요.");
    return false;
  }

  if (!student.detailRequest.address) {
    alert("주소를 입력해주세요.");
    return false;
  }

  if (!student.detailRequest.phoneNumber) {
    alert("전화번호를 입력해주세요.");
    return false;
  }

  if (!student.detailRequest.email) {
    alert("이메일을 입력해주세요.");
    return false;
  }
  // 학번 형식 검사 (예: 영문과 숫자 조합)
  const studentNumberPattern = /^[A-Za-z0-9]+$/;
  if (!studentNumberPattern.test(student.studentNumber)) {
    alert("학번은 영문과 숫자만 입력 가능합니다.");
    return false;
  }

  // 전화번호 형식 검사
  const phonePattern = /^[0-9-\s]+$/;
  if (!phonePattern.test(student.detailRequest.phoneNumber)) {
    alert("올바른 전화번호 형식이 아닙니다.");
    return false;
  }

  // 이메일 형식 검사 (입력된 경우에만)
  if (student.email && !isValidEmail(student.detailRequest.email)) {
    alert("올바른 이메일 형식이 아닙니다.");
    return false;
  }

  return true;
} //validateStudent

// 이메일 유효성 검사
function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

//학생목록 로드하는 함수
function loadStudents() {
  console.log("학생 목록 로드 중.....");
  fetch(`${API_BASE_URL}/api/students`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("학생 목록을 불러오는데 실패했습니다.");
      }
      return response.json();
    })
    .then((students) => renderStudentTable(students))
    .catch((error) => {
      console.log("Error: " + error);
      alert("학생 목록을 불러오는데 실패했습니다.");
    });
}

function renderStudentTable(students) {
  console.log(students);
  studentTableBody.innerHTML = "";

  students.forEach((student) => {
    const row = document.createElement("tr");

    row.innerHTML = `
                    <td>${student.name}</td>
                    <td>${student.studentNumber}</td>
                    <td>${student.detail ? student.detail.address : "-"}</td>
                    <td>${
                      student.detail ? student.detail.phoneNumber : "-"
                    }</td>
                    <td>${student.detail?.email ?? "-"}</td>
                    <td>${student.detail?.dateOfBirth ?? "-"}</td>
                    <td>
                        <button class="edit-btn" onclick="editStudent(${
                          student.id
                        })">수정</button>
                        <button class="delete-btn" onclick="deleteStudent(${
                          student.id
                        })">삭제</button>
                    </td>
                `;

    studentTableBody.appendChild(row);
  });
}
