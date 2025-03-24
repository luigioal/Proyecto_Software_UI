function CreateVacation() {
    this.InitView = function () {
        $('#btnCreate').click(function () {
            var view = new CreateVacation();
            view.SubmitVacationRequests();
        })
    }

    this.SubmitVacationRequests = function () {
        var apo = "http://localhost:5188/";

        // armar el objeto que se envia al API
        var vacation = {}
        vacation.employeeId = "1000000002";
        vacation.startDay = $('#startDay').val();
        vacation.endDay = $('#endDay').val();
        vacation.justification = $('#txtJustification').val();

        //hacer el llamado al API
        $.ajax({
            headers: {
                'Accept': "application/json",
                'Content-Type': "application/json",
            },
            method: "POST",
            url: api_url + "/api/Vacation/CreateVacation",
            contentType = "application/json; charset=utf-8",
            data: JSON.stringify(vacation),
            hasContent: true
        }).done(function () {
            alert("Vacation request creado correctamente");

        }).fail(function () {
            Swal.fire({
                title: "Message",
                text: "Hubo un erro al llamar al API",
                icon: "error"
            })
        })

        //
    }
}

$(document).ready(function () {
    var view = CreateVacation();
    view.InitView();
})
