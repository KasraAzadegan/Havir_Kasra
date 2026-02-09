export function alertSuccess(title, text = "") {
    Swal.fire({
      icon: "success",
      title,
      text,
      confirmButtonText: "باشه",
    });
  }
  
  export function alertError(title, text = "") {
    Swal.fire({
      icon: "error",
      title,
      text,
      confirmButtonText: "باشه",
    });
  }
  