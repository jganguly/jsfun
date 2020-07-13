var DEBUG = false;

var root = 'pgm';
var path = '/' + root + '/libphp/';
var loc;
var pmk, nam, ema, mob, pwd;
var currpage, pagetitle, colName, colType, sql;     			   // Page name = Table name
var inpName = [], inpMust = [];
var nr, hlColor = '#ED0B00', bgColor1 = 'black', bgColor2 = 'black';
var hlCol, hlrowno = -1, prrowno = -1;							   // hlrowno 2 .. 13, 0=header, 1=search
var where = "", cond = "", orderby = "", limit = " LIMIT 0," + nr;
var nrow, ncol, rows, page = 0;
var sortOrder = "DESC";
var autoPopList = [];

hlColor = 'mediumspringgreen';


$(function () {
    pmk = ajaxGetSessionValue('pmk');
});

function initPage() {
    loc = window.location.toString();
    createInp();
    autoPop(autoPopList);    

    sql = "SELECT " + colName + " FROM " + root + "." + currpage;
}



function ajaxGetSessionValue(sessvar) {
    var sessval;
    $.ajaxSetup({async: false, type: 'POST', dataType: 'JSON'});
    $.post(path + 'ajaxGetSessionValue.php', {'inp_1': sessvar}, function (data) {
        sessval = data['out_1'];
    });
    return (sessval);
}

function ajaxSetSessionValue(sessvar, sessval) {
    var sessvar, sessval
    $.ajaxSetup({async: false, type: 'POST', dataType: 'JSON'});
    $.post(path + 'ajaxSetSessionValue.php', {'inp_1': sessvar, 'inp_2': sessval}, function (data) {
        sessval = data['out_1'];
    });
    return (sessval);
}



function ajaxSelect(sql) {
    var nrow, ncol, arow, sql_error;
    $.ajaxSetup({async: false, type: 'POST', dataType: 'JSON'});
    $.post(path + 'ajaxSelect.php', {'svr_sql': sql},
        function (data) {
            showWait();
            nrow = data['svr_nrow'], ncol = data['svr_ncol'], arow = data['svr_arow'];
        })
        .done(function () {
            hideWait();
        });

    var obj = {'nrow': nrow, 'ncol': ncol, 'arow': arow};
    return obj;
}

function ajaxCrud(sqlCrud) {
    var nins = 0, sql_error;
    $.ajaxSetup({async: false, type: 'POST', dataType: 'JSON'});
    $.post(path + 'ajaxCrud.php', {'svr_sqlCrud': sqlCrud},
        function (data) {
            showWait();
            nins = data['svr_nrow'];
        })
        .done(function () {
            hideWait();
        });
    return (nins);
}



function createInp() {
    var c = colName.split(',');
    for (var i = 0; i < c.length; i++)
        inpName[i] = c[i].trim();

    var hid = null;
    for (var i = 0; i < inpName.length; i++) {
        if ((document.getElementById('id_tbx_' + inpName[i]) == null) &&
            (document.getElementById('id_sel_' + inpName[i]) == null) &&
            (document.getElementById('id_tar_' + inpName[i]) == null))
        {
            hid = document.createElement('input');
            hid.setAttribute("id", "id_hid_" + inpName[i]);
            hid.setAttribute("type", "hidden");
            document.body.appendChild(hid);
        }
    }
}

function setInpVal(rowno) { 			// Increase by 2 within function
    clsTop();
    for (var i = 0; i < inpName.length; i++) {
        var colPos = getColPos(inpName[i]);				// alert('*** ' + inpName[i] + ' : ' + colPos + ' : ' + getCell(rowno,colPos+1));
        set(inpName[i], getCell(rowno, colPos+1));	// +1 because of Sel column
    }
}

function getColPos(inp) {				// Get column position for an inpName
    col = colName.split(',');
    hlColor

    for (var i = 0; i < col.length; i++) {
        col[i] = col[i].trim();
        if (col[i] == inp)
            return (i)
    }
}

function getCell(r, c) {				// r is rowno, c is colno. Increase r by 2 before passing to the argument to account header and search rows
    try {
        return ( document.getElementById('id_table').rows[r+2].cells[c].innerHTML.replace(/&amp;/g, '&') );
    }
    catch (err) {
        return ""
    }
}


function display() {
    if (loc.indexOf('?') == -1) {                                                                   // No Key-Value
        ajaxPopTab();
    }
    else {  // chart
        if (loc.split('=')[1] == 'chart') {                                                     // key is vis, ?vis=visual
            // console.log('in display - chart');
            ajaxPopTab();
            chartJS();
        }
    }
}


/* Fin - selRow(r) */
function selRow(r) {
    r = r-1;
    var elem = 'id_cbx_' + r.toString();
    // alert(r + " *** " + elem + "***" + document.getElementById(elem).checked);

    if (document.getElementById('id_cbx_' + r).checked == false) {

        if (document.getElementById('id_cbx_' + r).style.visibility == "visible" ) {

            document.getElementById('id_cbx_' + r).checked = true;
            hilRow(r);                  // increased by 2 to account for table header + Search in hilRow
            setInpVal(r);

            for (j = 0; j <= colType.length; j++) {
                document.getElementById('id_table').rows[prrowno + 2].cells[j].style.backgroundColor = "rgba(0,0,0,0.0)";
            }
            if (prrowno != -1) {
                // alert('id_cbx_' + (prrowno));
                document.getElementById('id_cbx_' + (prrowno)).checked = false;
            }

            prrowno = r;
            onSelRowSetSel();
        }
    }
    else if (document.getElementById('id_cbx_' + r).checked == true) {
        document.getElementById('id_cbx_' + r).checked = false;
        unHilRow();
        prrowno = -1;
        onUnSelRowSetSel();
        clsTop();
    }
}




function hilRow(rowno) {
    try {
        for (var j = 0; j <= colType.length; j++)
            document.getElementById('id_table').rows[rowno+2].cells[j].style.backgroundColor = hlColor;
        hlrowno = rowno;
    }
    catch (err) {
    }
}

function unHilRow() {

    var elem = document.getElementById('id_cbx_' + prrowno.toString());
    try {
        elem.checked = false;   // uncheck
    }
    catch (err) { }

    for (j = 0; j <= colType.length; j++) {
        document.getElementById('id_table').rows[prrowno + 2].cells[j].style.backgroundColor = "rgba(0,0,0,0.0)";
    }

    hlrowno = -1;           
    prrowno = -1;
}

function onSelRowSetSel() {            // Can be overridden in .js files
}

function onUnSelRowSetSel() {
}          // Can be overridden in .js files



function clsTab() {         // unhighlight, cleartable
    if (colType.length != document.getElementById('id_table').rows[0].cells.length - 1) { // Error, mismatch between DB Cols and HTML Cols
        var msg = 'Check colType in .js file and c in gen.py' + 
                  'Cols in HTML Table=' + document.getElementById('id_table').rows[0].cells.length + '\n' +
                  'Cols in DB Table=' + colType.length + '\n' +
                  'nc_HTML_Table = nc_DB_Table + 1 (due to Sel Col)';
        alert(msg);
        return;
    }

    for (i = 2; i <= nr+1; i++) {     // nr rows: 2..11 corresponding to cbx 0..9
        document.getElementById('id_cbx_' + (i - 2)).style.visibility = 'hidden';        // hide checkbox
        for (j = 0; j < colType.length; j++) {
            document.getElementById('id_table').rows[i].cells[(j + 1)].innerHTML = '';   // clear table
        }
    }
}

function setCond() {
    cond = "";

    var c   = colName.split(',');

    for (var i = 0; i < c.length; i++)
        c[i] = c[i].trim();

    for (var i = 0; i < c.length; i++) {
        
        var getsea = "get(" + parseInt(i + 1) + ")";
        // alert(getsea);
        // alert(currpage);
        var ar = eval(getsea);

        var ar = ar.split(',');
        var l=-999999999999;
        var u= 999999999999;


        if ( ar.length == 1) {  // If nothing has been entered in search box, i.e., [""], length = 1
            if (colType[i] == 'S') {     // string
                if (ar[0] != "") {
                    var x =  ar[0].trim();
                    if (x[0] == "!") {
                        cond = cond + " AND " + c[i] + ' NOT LIKE ' + "'%" + x.substr(1) + "%'" + " ";
                    }
                    else {
                        cond = cond + " AND " + c[i] + ' LIKE ' + "'%" + ar[0] + "%'" + " ";
                    }
                }
            }
            else if ( colType[i] == 'D') {
                if (ar[0] == "")
                    ar[0] = "2000-01-01";
                cond = cond + " AND " + c[i] + ' >= '   + "'"  + ar[0] + "'" + " ";                
            }
            else if ( (colType[i] == 'M') || (colType[i] == 'N')) {
                if (ar[0] == "")
                    ar[0] = l;
                // alert("***"+ar[0]);
                cond = cond + " AND " + c[i] + ' >= '   + ar[0] + " ";                
            }            
        }
        else {

            if (ar[0] != "") {
                l = ar[0];
            }
            if (ar[1] != "") {
                u = ar[1];
            }

            if (colType[i] == 'D') {    // date
                l = new Date(l);
                l = "'" + l.toISOString().slice(0,19).replace('T',' ') + "'";

                u = new Date(u);
                u = "'" + u.toISOString().slice(0,19).replace('T',' ') + "'";
            }

            if ( (colType[i] == 'N') || (colType[i] == 'M') || (colType[i] == 'D') ) {  
                cond = cond + " AND " + c[i] + ' >= ' + l + " AND " + c[i] + " <= " + u + " ";
            }

            else if (colType[i] == 'S') {
                cond = cond + " AND ("; 
                for (var n=0; n<ar.length; n++) {

                    if ( n == (ar.length - 1)) {
                            cond = cond + c[i] + ' LIKE ' + "'%" + ar[n].trim() + "%'" ;
                    }
                    else {
                            cond = cond + c[i] + ' LIKE ' + "'%" + ar[n].trim() + "%'" + " OR ";
                    }
                }
                cond = cond + ")"; 
            }
        }
    }   

    // alert(cond);
}



function ajaxPopTab() { // values in table cannot be

    clsTab();
    setWhereCond();
    var L1 = page * nr;
    var L2 = (page + 1) * nr;
    limit = 'LIMIT ' + L1 + ', ' + L2;
    var sqls = sql + ' ' + where + ' ' + cond + ' ' + orderby + ' ' + limit;

    if (DEBUG) {
        alert(sqls);
        console.log(sqls);
    }


    var obj = ajaxSelect(sqls);
    nrow = obj.nrow;
    ncol = obj.ncol;
    rows = obj.arow;

    var L2 = Math.min(nrow, nr);

    for (i = 0; i < L2; i++) {                                                                      // Populate the table

        document.getElementById('id_cbx_' + i).style.visibility = 'visible';                        // Set checkbox visible
        var cell = document.getElementById('id_table').rows[i + 2].cells;                           // Get cells for that row

        for (j = 0; j < colType.length; j++) {                  // Set all the Cells in Table

            var key = i + '-' + j;                              //alert(rows[key]);

            if (colType[j] == 'S') {                            // Column shifts by 1, 1st column is checkbox, String
                var x = rows[key];        // Textarea Replace \n with <BR>
                // var x = rows[key].replace(/\n/g,'<BR>');        // Textarea Replace \n with <BR>
                var x2 = x.replace(/'/g,"\'");                  // Textarea Replace \n with <BR>
                cell[(j + 1)].innerHTML = x2;                   // Text format colType = 0 = String
                // console.log(x2);
                // cell[(j + 1)].innerHTML = rows[key];         // Text format colType = 0 = String
            }
            else if (colType[j] == 'D') {                       // Column shifts by 1, 1st column is checkbox, Date
                rows[key] = rows[key];                          // rows[key] = rows[key].split(' ')[0];     // format '2014-04-15 00:00:00'
                
                if ( rows[key] != '0000-00-00') {
                    cell[(j + 1)].innerHTML = rows[key].substring(0,16);
                    // cell[(j + 1)].innerHTML = rows[key];
                }
                else
                    cell[j + 1].innerHTML = '';
            }
            else if (colType[j] == 'N')                         // Column shifts by 1, 1st column is checkbox, Number
                cell[j + 1].innerHTML = parseFloat(rows[key]).toLocaleString("en-IN", {maximumFractionDigits: 0});

            else if (colType[j] == 'M')                         // Column shifts by 1, 1st column is checkbox, Money
                cell[j + 1].innerHTML = parseFloat(rows[key]).toLocaleString("en-IN", {minimumFractionDigits: 2}, {maximumFractionDigits: 2});

            else if (colType[j] == 'I')                         // Column shifts by 1, 1st column is checkbox, Integer
                cell[(j + 1)].innerHTML = parseInt(rows[key]);

            else if (colType[j] == 'F') {                       // Column shifts by 1, 1st column is checkbox, Integer
                cell[(j + 1)].innerHTML = parseFloat(rows[key]).toFixed(2);
            }

            highlight(j,cell);  // Overriden in currpage
        }
    }

    // Total
    var sqlc, ntot = 0;
    
    sqlc = sql + ' ' + where + ' ' + cond + ' ' + orderby;

    var obj = ajaxSelect(sqlc);
    ntot = obj.nrow;
    ncol = obj.ncol;
    rows = obj.arow;

    if (ntot != undefined) {
        if (ntot !=0) {
            setDiv('num', " <span style='color:yellow;'>" + currtitle + ": " + "</span>" + ntot + " Rec, Page " + (page + 1) + " of " + parseInt(Math.floor(ntot / nr) + 1));   // Display page num
        }
        else {
            setDiv('num', " <span style='color:yellow;'>" + currtitle + ": " + "</span>" + ntot + " Rec, Page " + (page + 1) + " of " + 1 );   // Display page num
        }

    }
    else
        setDiv('num', " <span style='color:yellow;'>" + currtitle + ": " + "</span>" + "0 Rec, Page 1 of 1");       // Display page num

}

// Dummy
function highlight(j,cell) {

}


function sortColumn(col) {
    if (col == '')
        return;

    clsTop();

    if (sortOrder.toLowerCase() == "asc") {
        sortOrder = "desc";
        orderby = " ORDER BY " + currpage + "." + col + " " + sortOrder + ' ';
        ajaxPopTab();
        unHilRow();
        return;
    }

    if (sortOrder.toLowerCase() == "desc") {
        sortOrder = "asc";
        orderby = " ORDER BY " + currpage + "." + col + " " + sortOrder + ' ';
        ajaxPopTab();
        unHilRow();
        return;
    }
}




function cls() {					     // clsTop + clsTab (through ajaxPopTab)
    unHilRow();
    clsTop();         
    page = 0;
    setCond();  
    display();      			    // needed for vis module
    location.reload();
}

function clsTop() {				         // clears inpName at top
    for (i = 0; i < inpName.length; i++) {
        set(inpName[i], '');
    }
    onUnSelRowSetSel();
}

function clf() { 						 // clear search filter, invoked when the gif image is clicked
    for (i = 1; i <= 16; i++) {
        try {
            set(i, '');
        } catch (err) { }
    } 

    cls();
}

function sea() {						// invoked onchange sea fields
    clsTop();        
    page = 0;
    var L1 = page * nr;
    var L2 = (page + 1) * nr;
    limit = ' LIMIT ' + L1 + ', ' + L2;

    for (var i=1; i<=16; i++) {
        var id = 'sea_' + parseInt(i);
        ajaxSetSessionValue(id,get(i))
    }

    unHilRow();
    display();
    onSelRowSetSel();

}




function nxt() {
    unHilRow();

    page = page + 1;
    var L1 = page * nr;
    var L2 = (page + 1) * nr;
    limit = 'LIMIT ' + L1 + ', ' + L2;
    var sqls = sql + ' ' + where + ' ' + cond + ' ' + orderby + ' ' + limit;
   

    nrow = ajaxSelect(sqls).nrow;

    if (nrow == 0) {
        page = page - 1;
        message("At End of List");
        return;
    }
    else {
        clsTop();
        ajaxPopTab();
    }

    if (currpage == "bank") uclBal();

}

function prv() {

    unHilRow();

    if (page == 0) {
        message("At beginning of list");
        return;
    }
    else {
        clsTop();
        page = page - 1;
        var L1 = page * nr;
        var L2 = (page + 1) * nr;
        limit = 'LIMIT ' + L1 + ', ' + L2;
        ajaxPopTab();
    }

    if (currpage == "bank") uclBal();
}


function isEmpty() {
    var val;
    for (i = 0; i < inpMust.length; i = i + 2) {
        if (get(inpMust[i]) == "") {
            message(inpMust[i + 1]);
            return (true);
        }
    }
    return (false);
}

function createSqlIns() {

    var sqlIns = "INSERT INTO " + root + '.' + currpage + "(";
    for (i = 0; i < inpName.length-1; i++) {      // pmk is always last
        if (i != inpName.length - 2)
            sqlIns = sqlIns + inpName[i] + ",";
        else
            sqlIns = sqlIns + inpName[i] + ") VALUES(";
    }

    var val = "";
    for (i = 0; i < inpName.length-1; i++) {      // pmk is always last
        var val = "";
        var ct = colType[getColPos(inpName[i])];

        if ( (ct == 'S') || (ct == 'D') || (ct == 'R') )
            val = "'" + get(inpName[i]) + "'";
        else                                      // 'I', 'F', 'N','M'
            val = strToNumber(get(inpName[i]));

        if ( (i != (inpName.length - 2)) )
            sqlIns = sqlIns + val + ",";
        else                                      // any other
            sqlIns = sqlIns + val;
    }

    sqlIns = sqlIns + ");";
    if (DEBUG)
        console.log(sqlIns);
    return (sqlIns);
}

function createSqlUpd() {

    var val = "";
    var sqlUpd = "UPDATE " + root + "." + currpage + " SET lup=NOW(), ";

    for (i = 0; i < inpName.length-1; i++) {  // pmk is always last
        var ct = colType[getColPos(inpName[i])];


        if ( (ct == 'S') || (ct == 'D') ) {
            val = get(inpName[i]);
            // val = val.replace(/'/g,"\\'");
            val = "'" + val + "'";
        }
        else    // 'I', 'F', 'N','M'
            val = strToNumber(get(inpName[i]));


        if ( (i != (inpName.length - 2)) )
            sqlUpd = sqlUpd + inpName[i] + "=" + val + ",";
        else
            sqlUpd = sqlUpd + inpName[i] + "=" + val;
    }

    sqlUpd = sqlUpd + " WHERE pmk = " + get('pmk');
    if (DEBUG)
        console.log(sqlIns);

    return (sqlUpd);
}



function findRowNo(lid) {
    var index = getColPos('pmk') + 1;

    var pmk;
    if (lid == 0)
        pmk = get('pmk');	// update
    else
        pmk = lid;			// insert

    var sqlcount;
    sqlcount = "SELECT COUNT(pmk) FROM " + root + "." + currpage;

    var ntotal = ajaxSelect(sqlcount).arow['0-0'];
    var npage = Math.ceil(ntotal / nr);

    // relies on the page global variable to locate the right page; ajaxPopTab() uses page
    for (page = 0; page < npage; page++) {  
        ajaxPopTab();
        for (var i = 0; i < nr; i++) {
            // console.log(pmk + ' : ' + getCell(i,index) );
            if (pmk == getCell(i, index)) {
                var found = i;
                setInpVal(found);
                unHilRow();
                document.getElementById('id_cbx_' + found).checked = true;
                hilRow(found);
                prrowno = found;
                return (i)
            }
        }
    }
}

function getLID() { // Dummy

}


function insRec() {

    if (isEmpty())
        return;

    var sqlIns = createSqlIns();
    if (DEBUG)
        alert(sqlIns);
    var nins = ajaxCrud(sqlIns);


    if (nins == 1) {
        ajaxPopTab();
        var lid = getLID();
        findRowNo(lid);
        
        if ( (currpage == "gan") || ((currpage == "url")) ) {
            document.getElementById("id_anc_url").text = get('url');
        }
    }
    else
        message("Error Creating Record");
}

function updRec() {

    if (hlrowno == -1) { 							// No Record Selected
        message('No Record Selected');
        return false;
    }

    if (isEmpty())
        return;

    var sqlUpd = createSqlUpd();
    if (DEBUG)
        alert(sqlUpd);    
    var nupd = ajaxCrud(sqlUpd);



    if (nupd == 1) {
        var pmk = getCell(prrowno, 1);

        ajaxPopTab();
        findRowNo(0);	// 0 for update, lid for insert

        if ( (currpage == "gan") || ((currpage == "url")) ) {
            document.getElementById("id_anc_url").text = get('url');
        }
    }
    else {
        // message("Error Updating Record");
    }
}

function delRec() {

    if (hlrowno == -1) {    // No Record Selected
        message('No Record Selected');
        return false;
    }

    var sqlDel = "DELETE FROM " + root + '.' + currpage + " WHERE pmk = " + get('pmk');
    if (DEBUG)
        alert(sqlDel);
    var ndel = ajaxCrud(sqlDel);

    clsTop();
    page = 0;
    cond = " ";
    ajaxPopTab();
    getBal();
    uclBal();

    unHilRow();
}


function get(id) {
    try {
            elem = document.getElementById('id_tbx_' + id);
            return (elem.value).replace(/'/g, "\\'");
        } catch (err) {
    }
    try {
            elem = document.getElementById('id_sel_' + id);
            return (elem.value);
        } catch (err) {
    }
    try {
            elem = document.getElementById('id_tar_' + id);
            return (elem.value).replace(/'/g, "\\'");
        } catch (err) {
    } // Escape "'" in textarea
    try {
            elem = document.getElementById('id_sea_' + id);
            return (elem.value);
        } catch (err) {
    }
    try {
            elem = document.getElementById('id_hid_' + id);
            return (elem.value);
        } catch (err) {
    }
}

function set(id, value) {
    var tmp = value.replace(/<br>/g, '\n');
    value = tmp.replace(/'/g, "\'");

    try {
            elem = document.getElementById('id_tbx_' + id);
            elem.value = value;
        } catch (err) {
    }
    try {
            elem = document.getElementById('id_sel_' + id);
            if (value == '')
                elem.selectedIndex = 0;
            else 
                elem.value = value;
        } catch (err) {
    }
    try {
            elem = document.getElementById('id_tar_' + id);
            elem.value = value;
        } catch (err) {
    }
    try {
            elem = document.getElementById('id_sea_' + id);
            elem.value = value;
        } catch (err) {
    }
    try {
            elem = document.getElementById('id_hid_' + id);
            elem.value = value;
        } catch (err) {
    }
}

function setSel(id, listVal) {
    id = 'id_sel_' + id;
    if (document.getElementById(id) == null)
        alert('Error: ' + id + ' Not Found');

    var n = document.getElementById(id).options.length = listVal.length;
    for (i = 0; i < n; i++) {
        document.getElementById(id).options[i].text = listVal[i];
        document.getElementById(id).options[i].value = listVal[i];
    }
}


function setDiv(id, value) {
    id = 'id_div_' + id;
    if (document.getElementById(id) == null)
        alert('Error: ' + id + ' Not Found');
    else
        document.getElementById(id).innerHTML = value;
}


function chkNum(id) {  				    // Check if it is a number

    var numbers = /^[0-9,.,-]+$/;  		// Digits and comma allowed

    value = document.getElementById(id).value;

    if (!value.match(numbers)) {
        message("Please Enter a Number");
        document.getElementById(id).focus();
        return false;
    }

    return true;
}

function today() {						// return format "2013-6-28 21:15"
    var dt = new Date().toISOString().substring(0, 10);
    return (dt);
}


function timeDiff(dt1, dt2) {     
    var dt1 = new Date(dt1);
    var dt2 = new Date(dt2);
    var td = dt2.getTime() - dt1.getTime();
    var dd = td / (1000 * 3600 * 24); 
    return (dd);
}


function ts() {							// current time in long seconds
    return new Date().getTime();
}

function strToMoney(str) {
    if ((str == '') || (str == null))
        return (0);
    num = parseFloat(str.replace(/,/g, ''));
    num = parseFloat(num).toLocaleString("en-IN", {minimumFractionDigits: 2});
    return (num);
}

function strToNumber(str) {
    if ((str == '') || (str == null))
        return (0);
    num = parseFloat(str.replace(/,/g, ''));
    return (num);
}

function strToDate(str) {
    if ((str == '') || (str == null))
        return ('0001-01-01');
    else
        return (str);
}

function padNum(str,len, pre) { 

    if (str == null)
        return;

    var gap = len - str.length;

    str = parseFloat(str).toLocaleString("en-IN", {minimumFractionDigits: pre, maximumFractionDigits: pre});

    for (var i=0; i< gap; i++) {
        str = "&nbsp;&nbsp;&nbsp;" + str; 
    }

  return(str);
}




// Autocomplete for dates and input fields other than id_tbx_itm
function autoPop(inpList) {

    // Dates
    try {
        $("#id_tbx_dat").datepicker({dateFormat: 'yy-mm-dd'});  // Date
        $("#id_tbx_dos").datepicker({dateFormat: 'yy-mm-dd'});  // Date of Start
        $("#id_tbx_doe").datepicker({dateFormat: 'yy-mm-dd'});  // Date of End
        $("#id_tbx_dom").datepicker({dateFormat: 'yy-mm-dd'});  // Date of Maturity
        $("#id_tbx_dop").datepicker({dateFormat: 'yy-mm-dd'});  // Date of Purchase
        $("#id_tbx_due").datepicker({dateFormat: 'yy-mm-dd'});  // Due Date
    } catch (err) { }

    for (var i = 0; i < inpList.length; i++) {

        var sql = "SELECT DISTINCT(" + inpList[i] + ") FROM " + root + "." + currpage + " ORDER BY " + inpList[i] + " ASC";
        var obj = ajaxSelect(sql);
        var nrow = obj.nrow;
        var arow = obj.arow;
        var aut = [];
        for (j = 0; j < nrow; j++) {
            aut.push(arow[j + '-0']);
            aut.sort();
        }

        if (document.getElementById('id_tbx_' + inpList[i]) != null) {
            var inp = "#id_tbx_" + inpList[i];
            $(inp).autocomplete(
                {
                    source: aut,
                    minLength: 0,
                    max: 6,
                    highlightItem: true,
                    multiple: true,
                    multipleSeparator: " ",
                }).focus(function () {
                $(this).autocomplete('search', $(this).val());
            });
        }

    
    }
}


function showWait() {
    var img = document.getElementById('id_img_wai');
    if (document.getElementById('id_img_wai') != null)
        img.style.visibility = 'visible';
}

function hideWait() {
    var img = document.getElementById('id_img_wai');
    if (document.getElementById('id_img_wai') != null)
        img.style.visibility = 'hidden';
}




/** Function calls, no confirmation messages **/
$(function () {
    $(" #id_but_cls").click(function () {
        cls();
    })
});
$(function () {
    $("#id_but_nxt").click(function () {
        nxt();
    })
});
$(function () {
    $("#id_but_pre").click(function () {
        prv();
    })
});



/** Function calls, requires confirmation messages **/
// ins
$(function () {
    $("#id_but_ins").click(function () {
        $("#id_div_ins").dialog("open");
    })
});

$(function () {
    $("#id_div_ins").dialog(ok_cancel_ins);
    });

    var ok_cancel_ins = {
    autoOpen: false, resizable: false, width: 300, height: 200, modal: true,
    buttons: {
        "OK": {
            text: "OK", id: "id_ok_ins",
            click: function () {
                $(this).dialog("close");
                insRec();
            }
        },
        "Cancel": {
            text: "Cancel", id: "id_cancel_ins",
            click: function () {
                $(this).dialog("close");
                unHilRow();
                clsTop();
            }
        }
    }
};


// upd
$(function () {
    $("#id_but_upd").click(function () {
        $("#id_div_upd").dialog("open");
    });
});

$(function () {
    $("#id_div_upd").dialog(ok_cancel_upd);
    });

    var ok_cancel_upd = {
    autoOpen: false, resizable: false, width: 300, height: 200, modal: true,
    buttons: {
        "OK": {
            text: "OK", id: "id_ok_upd",
            click: function () {
                $(this).dialog("close");
                updRec();
            }
        },
        "Cancel": {
            text: "Cancel", id: "id_cancel_upd",
            click: function () {
                $(this).dialog("close");
                unHilRow();
                clsTop();
            }
        }
    }
};


//del
$(function () {
    $("#id_but_del").click(function () {
        $("#id_div_del").dialog("open");
    })
});

$(function () {
    $("#id_div_del").dialog(ok_cancel_del);
    });

    var ok_cancel_del = {
    autoOpen: false, resizable: false, width: 300, height: 200, modal: true,
    buttons: {
        "OK": {
            text: "OK", id: "id_ok_del",
            click: function () {
                $(this).dialog("close");
                delRec();
            }
        },
        "Cancel": {
            text: "Cancel", id: "id_cancel_del",
            click: function () {
                $(this).dialog("close");
                unHilRow();
                clsTop();
            }
        }
    }
};





/** Function Calls - Messages **/
$(function () {
    $("#id_div_msg").dialog({
        autoOpen: false, resizable: false, width: 300, height: 200, modal: true,
        buttons: {
            "OK": {
                text: "OK", id: "id_ok_msg",
                click: function () {
                    $(this).dialog("close");
                }
            }
        }
    });
});

function message(msg) {
    setDiv('msg', msg);
    $("#id_div_msg").dialog("open");
}

/** Function Calls - Advertisement **/
$(function () {
    $("#id_div_adv").dialog({
        autoOpen: false, resizable: false, width: 600, height: 300, modal: true
    });
});




/** jQuery Tooltip **/
$(function () {
    $(document).tooltip({
        position: {
            my: "center bottom-20",
            at: "center top",
            using: function (position, feedback) {
                $(this).css(position);
                $("<div>")
                    .addClass("arrow")
                    .addClass(feedback.vertical)
                    .addClass(feedback.horizontal)
                    .appendTo(this);
            }
        }
    });
});



document.onkeydown = function (e) {			// Do not use "onkeypress"
    e = e || window.event;
    var cmd_held = event.metaKey;

    // CHROME    
    // if ( navigator.userAgent.indexOf("Safari") != -1) { // will also work for Safari
        var key = event.keyCode || event.charCode || 0;
        key = String.fromCharCode((96 <= key && key <= 105) ? key-48 : key).toLowerCase();


        if(cmd_held && event.key.toLowerCase() == "j") {
           insRec();
        }
        if(cmd_held && event.key.toLowerCase() == "u") {
           updRec();
        }
        if(cmd_held && event.key.toLowerCase() == "k") 
           delRec();


        if(cmd_held && event.key.toLowerCase() == "'") {
           nxt();
        }
        if(cmd_held && event.key.toLowerCase() == ";") {
           prv();       
        }
        
        if(cmd_held && key == "e") {
           toggle_expand();       
        }

        if(cmd_held && key == "b") {
            if (currpage == "wrk") {
                view_remark();
            }
        }

    // }


    try {
        var selectedID = document.activeElement.id;
    }
    catch (err) { }


    if (prrowno != -1) {

        // alert(e.keyCode);

        if (selectedID != 'id_tar_rem') { 
            
            if ((e.keyCode == 40) && (hlrowno != -1)) {	// Down arrow
                x = prrowno;
                if (( x == (nr - 1) ) || (x == (nrow - 1)))
                    return;
                clsTop();
                unHilRow();			// unhighlight and continue
                setInpVal(x + 1);
                hilRow(x + 1);		// increase by 2 to account for table header + Search
                document.getElementById('id_cbx_' + (x + 1)).checked = true;
                prrowno = x + 1;
            }

            if ((e.keyCode == 38) && (hlrowno != -1)) {
                x = prrowno;
                if ((x == 0) || (x == -1))
                    return;
                clsTop();
                unHilRow();			// unhighlight and continue
                setInpVal(x - 1);
                hilRow(x - 1);		// increase by 2 to account for table header + Search
                document.getElementById('id_cbx_' + (x - 1)).checked = true;
                prrowno = x - 1;
            }
        }
        
    }

    /*
    if (e.keyCode == 39) {
        if ( (selectedID != 'id_tbx_hba') && 
             (selectedID != 'id_tbx_dat') && 
             (selectedID != 'id_tbx_cat') && 
             (selectedID != 'id_tbx_des') && 
             (selectedID != 'id_tbx_amt') &&     
             (selectedID != 'id_tbx_rem') && 
             (selectedID != 'id_sea_1') && 
             (selectedID != 'id_sea_2') && 
             (selectedID != 'id_sea_3') && 
             (selectedID != 'id_sea_4') && 
             (selectedID != 'id_sea_5') && 
             (selectedID != 'id_sea_6') ) 
            nxt();
    }

    if (e.keyCode == 37) {
        if ( (selectedID != 'id_tbx_hba') && 
             (selectedID != 'id_tbx_dat') && 
             (selectedID != 'id_tbx_cat') && 
             (selectedID != 'id_tbx_des') && 
             (selectedID != 'id_tbx_amt') &&     
             (selectedID != 'id_tbx_rem') && 
             (selectedID != 'id_sea_1') && 
             (selectedID != 'id_sea_2') && 
             (selectedID != 'id_sea_3') && 
             (selectedID != 'id_sea_4') && 
             (selectedID != 'id_sea_5') && 
             (selectedID != 'id_sea_6') ) 
            prv();
    }
    */

};

function view_goal() {

    if (hlrowno != -1) {
        var gid = document.getElementById('id_table').rows[hlrowno+2].cells[1].innerHTML;
        window.open( "../../module/kv_goal/kv_goal.php?gid="+gid, "_blank");
    }
}

function view_issue() {

    if (hlrowno != -1) {
        var pmk = document.getElementById('id_table').rows[hlrowno+2].cells[7].innerHTML;
        window.open( "../../module/kv_issue/kv_issue.php?pmk="+pmk, "_blank");
    }
}




/** Table Related **/
// $(function () {
//     $("#id_cbx_0").click(function () {
//         selRow(1);
//     });
// });
// $(function () {
//     $("#id_cbx_1").click(function () {
//         selRow(2);
//     });
//     });
// $(function () {
//     $("#id_cbx_2").click(function () {
//         selRow(3);
//     });
// });
// $(function () {
//     $("#id_cbx_3").click(function () {
//         selRow(4);
//     });
// });
// $(function () {
//     $("#id_cbx_4").click(function () {
//         selRow(5);
//     });
// });
// $(function () {
//     $("#id_cbx_5").click(function () {
//         selRow(6);
//     });
// });
// $(function () {
//     $("#id_cbx_6").click(function () {
//         selRow(7);
//     });
// });
// $(function () {
//     $("#id_cbx_7").click(function () {
//         selRow(8);
//     });
// });
// $(function () {
//     $("#id_cbx_8").click(function () {
//         selRow(9);
//     });
// });
// $(function () {
//     $("#id_cbx_9").click(function () {
//         selRow(10);
//     });
// });


// $(function () {
//     $("#id_cbx_10").click(function () {
//         selRow(11);
//     });
// });
// $(function () {
//     $("#id_cbx_11").click(function () {
//         selRow(12);
//     });
// });
// $(function () {
//     $("#id_cbx_12").click(function () {
//         selRow(13);
//     });
// });
// $(function () {
//     $("#id_cbx_13").click(function () {
//         selRow(14);
//     });
// });
// $(function () {
//     $("#id_cbx_14").click(function () {
//         selRow(15);
//     });
// });
// $(function () {
//     $("#id_cbx_15").click(function () {
//         selRow(16);
//     });
// });
// $(function () {
//     $("#id_cbx_16").click(function () {
//         selRow(17);
//     });
// });
// $(function () {
//     $("#id_cbx_17").click(function () {
//         selRow(18);
//     });
// });
// $(function () {
//     $("#id_cbx_18").click(function () {
//         selRow(19);
//     });
// });
// $(function () {
//     $("#id_cbx_19").click(function () {
//         selRow(20);
//     });
// });


// $(function () {
//     $("#id_cbx_20").click(function () {
//         selRow(21);
//     });
// });
// $(function () {
//     $("#id_cbx_21").click(function () {
//         selRow(22);
//     });
// });
// $(function () {
//     $("#id_cbx_22").click(function () {
//         selRow(23);
//     });
// });
// $(function () {
//     $("#id_cbx_23").click(function () {
//         selRow(24);
//     });
// });
// $(function () {
//     $("#id_cbx_24").click(function () {
//         selRow(25);
//     });
// });
// $(function () {
//     $("#id_cbx_25").click(function () {
//         selRow(26);
//     });
// });
// $(function () {
//     $("#id_cbx_26").click(function () {
//         selRow(27);
//     });
// });
// $(function () {
//     $("#id_cbx_27").click(function () {
//         selRow(28);
//     });
// });
// $(function () {
//     $("#id_cbx_28").click(function () {
//         selRow(29);
//     });
// });
// $(function () {
//     $("#id_cbx_29").click(function () {
//         selRow(30);
//     });
// });


// $(function () {
//     $("#id_cbx_30").click(function () {
//         selRow(31);
//     });
// });
// $(function () {
//     $("#id_cbx_31").click(function () {
//         selRow(32);
//     });
// });
// $(function () {
//     $("#id_cbx_32").click(function () {
//         selRow(33);
//     });
// });
// $(function () {
//     $("#id_cbx_33").click(function () {
//         selRow(34);
//     });
// });
// $(function () {
//     $("#id_cbx_34").click(function () {
//         selRow(35);
//     });
// });
// $(function () {
//     $("#id_cbx_35").click(function () {
//         selRow(36);
//     });
// });
// $(function () {
//     $("#id_cbx_36").click(function () {
//         selRow(37);
//     });
// });
// $(function () {
//     $("#id_cbx_37").click(function () {
//         selRow(38);
//     });
// });
// $(function () {
//     $("#id_cbx_38").click(function () {
//         selRow(39);
//     });
// });
// $(function () {
//     $("#id_cbx_39").click(function () {
//         selRow(40);
//     });
// });



// $(function () {
//     $("#id_cbx_40").click(function () {
//         selRow(41);
//     });
// });
// $(function () {
//     $("#id_cbx_41").click(function () {
//         selRow(42);
//     });
// });
// $(function () {
//     $("#id_cbx_42").click(function () {
//         selRow(43);
//     });
// });
// $(function () {
//     $("#id_cbx_43").click(function () {
//         selRow(44);
//     });
// });
// $(function () {
//     $("#id_cbx_44").click(function () {
//         selRow(45);
//     });
// });
// $(function () {
//     $("#id_cbx_45").click(function () {
//         selRow(46);
//     });
// });
// $(function () {
//     $("#id_cbx_46").click(function () {
//         selRow(47);
//     });
// });
// $(function () {
//     $("#id_cbx_47").click(function () {
//         selRow(48);
//     });
// });
// $(function () {
//     $("#id_cbx_48").click(function () {
//         selRow(49);
//     });
// });
// $(function () {
//     $("#id_cbx_49").click(function () {
//         selRow(50);
//     });
// });



// $(function () {
//     $("#id_cbx_50").click(function () {
//         selRow(51);
//     });
// });
// $(function () {
//     $("#id_cbx_51").click(function () {
//         selRow(52);
//     });
// });
// $(function () {
//     $("#id_cbx_52").click(function () {
//         selRow(53);
//     });
// });
// $(function () {
//     $("#id_cbx_53").click(function () {
//         selRow(54);
//     });
// });
// $(function () {
//     $("#id_cbx_54").click(function () {
//         selRow(55);
//     });
// });
// $(function () {
//     $("#id_cbx_55").click(function () {
//         selRow(56);
//     });
// });
// $(function () {
//     $("#id_cbx_56").click(function () {
//         selRow(57);
//     });
// });
// $(function () {
//     $("#id_cbx_57").click(function () {
//         selRow(58);
//     });
// });
// $(function () {
//     $("#id_cbx_58").click(function () {
//         selRow(59);
//     });
// });
// $(function () {
//     $("#id_cbx_59").click(function () {
//         selRow(60);
//     });
// });


// $(function () {
//     $("#id_cbx_60").click(function () {
//         selRow(61);
//     });
// });
// $(function () {
//     $("#id_cbx_61").click(function () {
//         selRow(62);
//     });
// });
// $(function () {
//     $("#id_cbx_62").click(function () {
//         selRow(63);
//     });
// });
// $(function () {
//     $("#id_cbx_63").click(function () {
//         selRow(64);
//     });
// });
// $(function () {
//     $("#id_cbx_64").click(function () {
//         selRow(65);
//     });
// });
// $(function () {
//     $("#id_cbx_65").click(function () {
//         selRow(66);
//     });
// });
// $(function () {
//     $("#id_cbx_66").click(function () {
//         selRow(67);
//     });
// });
// $(function () {
//     $("#id_cbx_67").click(function () {
//         selRow(68);
//     });
// });
// $(function () {
//     $("#id_cbx_68").click(function () {
//         selRow(69);
//     });
// });
// $(function () {
//     $("#id_cbx_69").click(function () {
//         selRow(70);
//     });
// });



// $(function () {
//     $("#id_cbx_70").click(function () {
//         selRow(71);
//     });
// });
// $(function () {
//     $("#id_cbx_71").click(function () {
//         selRow(72);
//     });
// });
// $(function () {
//     $("#id_cbx_72").click(function () {
//         selRow(73);
//     });
// });
// $(function () {
//     $("#id_cbx_73").click(function () {
//         selRow(74);
//     });
// });
// $(function () {
//     $("#id_cbx_74").click(function () {
//         selRow(75);
//     });
// });
// $(function () {
//     $("#id_cbx_75").click(function () {
//         selRow(76);
//     });
// });
// $(function () {
//     $("#id_cbx_76").click(function () {
//         selRow(77);
//     });
// });
// $(function () {
//     $("#id_cbx_77").click(function () {
//         selRow(78);
//     });
// });
// $(function () {
//     $("#id_cbx_78").click(function () {
//         selRow(79);
//     });
// });
// $(function () {
//     $("#id_cbx_79").click(function () {
//         selRow(80);
//     });
// });


// $(function () {
//     $("#id_cbx_80").click(function () {
//         selRow(81);
//     });
// });
// $(function () {
//     $("#id_cbx_81").click(function () {
//         selRow(82);
//     });
// });
// $(function () {
//     $("#id_cbx_82").click(function () {
//         selRow(83);
//     });
// });
// $(function () {
//     $("#id_cbx_83").click(function () {
//         selRow(84);
//     });
// });
// $(function () {
//     $("#id_cbx_84").click(function () {
//         selRow(85);
//     });
// });
// $(function () {
//     $("#id_cbx_85").click(function () {
//         selRow(86);
//     });
// });
// $(function () {
//     $("#id_cbx_86").click(function () {
//         selRow(87);
//     });
// });
// $(function () {
//     $("#id_cbx_87").click(function () {
//         selRow(88);
//     });
// });
// $(function () {
//     $("#id_cbx_88").click(function () {
//         selRow(89);
//     });
// });
// $(function () {
//     $("#id_cbx_89").click(function () {
//         selRow(90);
//     });
// });


// $(function () {
//     $("#id_cbx_90").click(function () {
//         selRow(91);
//     });
// });
// $(function () {
//     $("#id_cbx_91").click(function () {
//         selRow(92);
//     });
// });
// $(function () {
//     $("#id_cbx_92").click(function () {
//         selRow(93);
//     });
// });
// $(function () {
//     $("#id_cbx_93").click(function () {
//         selRow(94);
//     });
// });
// $(function () {
//     $("#id_cbx_94").click(function () {
//         selRow(95);
//     });
// });
// $(function () {
//     $("#id_cbx_95").click(function () {
//         selRow(96);
//     });
// });
// $(function () {
//     $("#id_cbx_96").click(function () {
//         selRow(97);
//     });
// });
// $(function () {
//     $("#id_cbx_97").click(function () {
//         selRow(98);
//     });
// });
// $(function () {
//     $("#id_cbx_98").click(function () {
//         selRow(99);
//     });
// });
// $(function () {
//     $("#id_cbx_99").click(function () {
//         selRow(100);
//     });
// });

