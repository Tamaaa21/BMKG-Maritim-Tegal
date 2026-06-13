import Swal, { SweetAlertIcon } from 'sweetalert2';

// Utility for beautiful popups in the admin panel
export const showToast = (title: string, icon: SweetAlertIcon = 'success') => {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon: icon,
    title: title,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });
};

export const showSuccess = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: text,
    confirmButtonColor: '#003399',
    confirmButtonText: 'OK',
    customClass: {
      confirmButton: 'bg-[#003399] text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors'
    }
  });
};

export const showError = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: text,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Tutup',
    customClass: {
      confirmButton: 'bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors'
    }
  });
};

export const showConfirm = async (title: string, text?: string, confirmText: string = 'Ya, Hapus!') => {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: text,
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: confirmText,
    cancelButtonText: 'Batal',
    customClass: {
      confirmButton: 'bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors mx-2',
      cancelButton: 'bg-slate-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-600 transition-colors mx-2'
    },
    buttonsStyling: false
  });
};
