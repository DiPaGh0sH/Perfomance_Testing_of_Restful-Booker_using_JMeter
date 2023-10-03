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

    var data = {"OkPercent": 68.58181818181818, "KoPercent": 31.418181818181818};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.46675757575757576, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4980909090909091, 500, 1500, "Update Booking"], "isController": false}, {"data": [0.6318181818181818, 500, 1500, "Token Generate"], "isController": false}, {"data": [0.4938181818181818, 500, 1500, "Delete Booking"], "isController": false}, {"data": [0.008818181818181819, 500, 1500, "Create Booking"], "isController": false}, {"data": [0.585, 500, 1500, "Get Updated Booking"], "isController": false}, {"data": [0.583, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 33000, 10368, 31.418181818181818, 7642.522363636378, 0, 84684, 347.0, 58610.0, 79519.0, 84469.0, 365.8779963190456, 359.89143237424327, 78.7921599898552], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Update Booking", 5500, 1901, 34.56363636363636, 403.11090909091024, 0, 2023, 391.0, 993.0, 1467.0, 1608.0, 64.3071778502695, 67.26502257693477, 19.108720327352767], "isController": false}, {"data": ["Token Generate", 5500, 1901, 34.56363636363636, 266.4090909090907, 0, 1842, 347.0, 392.0, 431.0, 1784.9899999999998, 64.04956271616727, 61.31950696757346, 11.623949368820673], "isController": false}, {"data": ["Delete Booking", 5500, 2114, 38.43636363636364, 684.3847272727268, 0, 12263, 374.0, 1463.0, 1579.7999999999993, 9778.99, 65.648126044402, 66.94247349829912, 9.590757601754595], "isController": false}, {"data": ["Create Booking", 5500, 646, 11.745454545454546, 43647.512363636284, 1364, 84684, 43866.5, 84140.0, 84179.95, 84589.0, 60.98101827213057, 47.06779616678863, 23.755831309872274], "isController": false}, {"data": ["Get Updated Booking", 5500, 1905, 34.63636363636363, 322.6694545454544, 0, 10149, 360.0, 794.0, 886.9499999999998, 1029.9799999999996, 64.90517943331878, 68.27702194385111, 9.156044128883984], "isController": false}, {"data": ["Get Booking", 5500, 1901, 34.56363636363636, 531.0476363636351, 0, 7513, 378.0, 854.8000000000011, 1853.6499999999987, 5626.98, 63.78438558240943, 67.2890385808554, 8.722627981920027], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 9720, 93.75, 29.454545454545453], "isController": false}, {"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: No such host is known (restful-booker.herokuapp.com)", 2, 0.019290123456790122, 0.006060606060606061], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/3.209.172.72, restful-booker.herokuapp.com/23.22.130.173, restful-booker.herokuapp.com/107.22.57.98, restful-booker.herokuapp.com/54.243.238.66] failed: Connection timed out: connect", 646, 6.23070987654321, 1.9575757575757575], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 33000, 10368, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 9720, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/3.209.172.72, restful-booker.herokuapp.com/23.22.130.173, restful-booker.herokuapp.com/107.22.57.98, restful-booker.herokuapp.com/54.243.238.66] failed: Connection timed out: connect", 646, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: No such host is known (restful-booker.herokuapp.com)", 2, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Update Booking", 5500, 1901, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 1901, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Token Generate", 5500, 1901, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 1901, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Delete Booking", 5500, 2114, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 2113, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: No such host is known (restful-booker.herokuapp.com)", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Create Booking", 5500, 646, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/3.209.172.72, restful-booker.herokuapp.com/23.22.130.173, restful-booker.herokuapp.com/107.22.57.98, restful-booker.herokuapp.com/54.243.238.66] failed: Connection timed out: connect", 646, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Updated Booking", 5500, 1905, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 1905, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Booking", 5500, 1901, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 1900, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: No such host is known (restful-booker.herokuapp.com)", 1, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
