$(document).ready(function(){
    $('.modal').modal();
  });

function toggleModal() {
	var instance = M.modal.getInstance($("#modal3"));
	instance.open();

}