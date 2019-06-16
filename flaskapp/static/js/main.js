///////////////////////// Automated Watering /////////////////////////
const autoSwitch = document.getElementById("autoSwitch");
const manualSwitch = document.getElementById("manualSwitch");

function getStatus() {
    jQuery.ajax({
        url: "/api/status",
        type: "POST",
        success: function (ndata) {
            status = ndata[0].status;
            if (status == "A") {
                autoSwitch.checked = true;
                manualSwitch.disabled = true;
                manualSwitch.checked = false;
            } else if (status == "M" || status == "F") {
                autoSwitch.checked = false;
                manualSwitch.checked = false;
            } else if (status == "O") {
                autoSwitch.checked = false;
                manualSwitch.checked = true;
                wait(3000);
                manualSwitch.checked = false;
            } else {
                autoSwitch.checked = true;
                manualSwitch.disabled = true;
                manualSwitch.checked = false;
            }
        }
    })
}

function auto() {
    let autoStatus;
    if (autoSwitch.checked) {
        autoStatus = "A";
        manualSwitch.disabled = true;
        manualSwitch.checked = false;
    } else {
        autoStatus = "M";
        manualSwitch.disabled = false;
    }
    // console.log(autoStatus);

    $.ajax({
        url: "changeStatus/" + autoStatus
    })

}

function manual() {
    let manualStatus;
    if (manualSwitch.checked) {
        manualStatus = "O";
    } else {
        manualStatus = "F";
    }
    // console.log(manualStatus);
    $.ajax({
        url: "changeStatus/" + manualStatus
    })
}

function updateSettings() {
    let max_humidity = document.getElementById("humMax").value;
    let max_temperature = document.getElementById("tempMax").value;
    let max_moisture = document.getElementById("soilMax").value;

    let jsonData = JSON.stringify({'humidity': max_humidity, 'temperature': max_temperature, 'moisture': max_moisture})

    jQuery.ajax({
        url: "/api/getMaxData",
        contentType: 'application/json',
        data: jsonData,
        type: 'POST',
        success: function () {
            return jsonData;
        }
    })
}


function getSettings() {
    jQuery.ajax({
        url: "/api/getMaxData",
        type: 'GET',
        success: function (ndata) {
            tempValue = ndata[0].Items.temperature;
            humValue = ndata[0].Items.humidity;
            soilValue = ndata[0].Items.moisture;

            $('#humMax').attr("value", humValue);
            $('#tempMax').attr("value", tempValue);
            $('#soilMax').attr("value", soilValue);

        }
    })
}

///////////////////////// Get readings /////////////////////////
function getData() {
    jQuery.ajax({
        url: "/api/getData",
        type: "POST",
        success: function (ndata) {
            tempValue = ndata[0].Items.temperature;
            humValue = ndata[0].Items.humidity;
            soilValue = ndata[0].Items.moisture1;
            lightValue = ndata[0].Items.light;

            $('#tempValue').html(tempValue);
            $('#humValue').html(humValue);
            $('#soilValue').html(soilValue);
            $('#lightValue').html(lightValue);
        }
    })
}

/////////////////////// Get Chart data ///////////////////////
function getChartData() {
    jQuery.ajax({
        url: "/api/getChartData",
        type: "POST",
        success: function (ndata) {
            // console.log(ndata)
            const chartData = ndata;
            // console.log("Getting Chart data")

            let tempArr = [];
            let humArr = [];
            let soilArr = [];
            let lightArr = [];
            let timeArr = [];

            chartData.forEach((e) => {
                tempArr.push(e.Items.temperature);
                humArr.push(e.Items.humidity);
                soilArr.push(e.Items.moisture1);
                lightArr.push(e.Items.light);

                let datetime = e.datetimeid;
                // console.log(datetime);
                jsdatetime = new Date(Date.parse(datetime));
                jstime = jsdatetime.toLocaleTimeString();
                timeArr.push(jstime);
            })

            createGraph(tempArr, timeArr, '#tempChart');
            createGraph(humArr, timeArr, '#humChart');
            createGraph(soilArr, timeArr, '#soilChart');
            createGraph(lightArr, timeArr, '#lightChart');

        }
    })
}


// Charts
function createGraph(data, newTime, newChart) {

    let chartData = {
        labels: newTime,
        series: [data]
    };
    // console.log(chartData);

    let options = {
        axisY: {
            onlyInteger: true
        },
        fullWidth: true,
        width: '100%',
        height: '100%',
        lineSmooth: true,
        chartPadding: {
            right: 50
        }
    };

    new Chartist.Line(newChart, chartData, options);

}

/////////////////////// run functions ///////////////////////
$(document).ready(function () {
    getData();
    getStatus();
    getChartData();
    updateSettings();
    getSettings();


    setInterval(function () {
        getData();
        getChartData();
        getSettings();
    }, 9000);
})
