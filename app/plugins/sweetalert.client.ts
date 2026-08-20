import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

export default defineNuxtPlugin(() => {
  const swal = Swal.mixin({
    buttonsStyling: false,
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: 'catat-swal-popup',
      title: 'catat-swal-title',
      htmlContainer: 'catat-swal-text',
      confirmButton: 'catat-swal-btn catat-swal-btn-danger',
      cancelButton: 'catat-swal-btn catat-swal-btn-ghost'
    }
  })

  return {
    provide: { swal }
  }
})
