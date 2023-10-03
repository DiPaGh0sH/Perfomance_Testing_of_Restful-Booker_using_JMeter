/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 98.14285714285714, "KoPercent": 1.8571428571428572};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7362857142857143, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8167142857142857, 500, 1500, "Update Booking"], "isController": false}, {"data": [0.9995714285714286, 500, 1500, "Token Generate"], "isController": false}, {"data": [0.8681428571428571, 500, 1500, "Delete Booking"], "isController": false}, {"data": [0.015714285714285715, 500, 1500, "Create Booking"], "isController": false}, {"data": [0.9177142857142857, 500, 1500, "Get Updated Booking"], "isController": false}, {"data": [0.7998571428571428, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21000, 390, 1.8571428571428572, 5682.144619047642, 296, 84216, 375.0, 22497.0, 46443.9, 79561.0, 214.8161787270607, 191.18481072201254, 65.08878269553387], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Update Booking", 3500, 130, 3.7142857142857144, 559.0914285714293, 303, 1986, 388.0, 1454.0, 1544.9499999999998, 1688.9899999999998, 37.35245779172269, 16.436748948795117, 16.9563900050159], "isController": false}, {"data": ["Token Generate", 3500, 0, 0.0, 341.3048571428568, 298, 998, 336.0, 371.0, 383.0, 424.97999999999956, 37.344885351201974, 11.503735572203668, 10.357370546622422], "isController": false}, {"data": ["Delete Booking", 3500, 130, 3.7142857142857144, 536.7151428571431, 302, 23618, 371.0, 1254.6000000000004, 1430.8499999999995, 1605.9599999999991, 37.91284378825136, 10.66695420060769, 8.991394799982668], "isController": false}, {"data": ["Create Booking", 3500, 130, 3.7142857142857144, 30991.695714285695, 1267, 84216, 25437.5, 67539.0, 79617.95, 84185.0, 37.78106413065772, 21.42044024722309, 16.0573739191917], "isController": false}, {"data": ["Get Updated Booking", 3500, 0, 0.0, 449.32199999999926, 296, 2311, 363.0, 894.0, 929.9499999999998, 1108.9899999999998, 37.65627353517096, 70.40508568147096, 8.121525200116197], "isController": false}, {"data": ["Get Booking", 3500, 0, 0.0, 1214.7385714285729, 300, 25569, 381.0, 1421.9, 4352.95, 22501.989999999998, 37.339705976486655, 69.96998321046793, 7.797997524910919], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["404/Not Found", 260, 66.66666666666667, 1.2380952380952381], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/23.22.130.173, restful-booker.herokuapp.com/107.22.57.98, restful-booker.herokuapp.com/54.243.238.66, restful-booker.herokuapp.com/3.209.172.72] failed: Connection timed out: connect", 130, 33.333333333333336, 0.6190476190476191], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21000, 390, "404/Not Found", 260, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/23.22.130.173, restful-booker.herokuapp.com/107.22.57.98, restful-booker.herokuapp.com/54.243.238.66, restful-booker.herokuapp.com/3.209.172.72] failed: Connection timed out: connect", 130, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Update Booking", 3500, 130, "404/Not Found", 130, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Delete Booking", 3500, 130, "404/Not Found", 130, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Create Booking", 3500, 130, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/23.22.130.173, restful-booker.herokuapp.com/107.22.57.98, restful-booker.herokuapp.com/54.243.238.66, restful-booker.herokuapp.com/3.209.172.72] failed: Connection timed out: connect", 130, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
