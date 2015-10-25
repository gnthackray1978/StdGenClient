/*POSTMAN CHROME EXTENSION
MANOWAR SLEIPNIR
*/

var JSMaster, QryStrUtils, AncUtils,Panels;

// $(document).ready(function () {
//     var jsMaster = new JSMaster();

//     jsMaster.generateHeader('#1', function () {
//         var ancSourceTypes = new AncSourceTypes();
//         ancSourceTypes.init();
//     });
// });

var BatchSearch = function () {
    this.qryStrUtils = new QryStrUtils();
    this.ancUtils = new AncUtils();
    this.selectorTools = new SelectorTools();
    this.pager = new Pager();
    this.DEFAULT_INSERTPERSONS_URL = '/Batches/AddPersons';
    this.DEFAULT_INSERTMARRIAGES_URL = '/Batches/AddMarriages';
    this.DEFAULT_INSERTSOURCES_URL = '/Batches/AddSources';
    this.DEFAULT_INSERTPARISHS_URL = '/Batches/AddParishs';
    this.DEFAULT_REMOVEBATCH_URL = '/Batches/RemoveBatch';
    this.DEFAULT_BATCHSELECT_URL = '/Batches/GetBatches';
     
    this.selection = [];
  
    this.postParams = {
        url: '',
        data: '',
        idparam: undefined,
        refreshmethod: this.getBatches,
        refreshArgs: ['1'],
        Context: this
    };
}



BatchSearch.prototype = {

    init: function () {
         
        var panels = new Panels();

        $('body').on("click", "#main", $.proxy(function () { panels.genericShowPanel('1'); return false; }, panels));
        $('body').on("click", "#more", $.proxy(function () { panels.genericShowPanel('2'); return false; }, panels));
        $('body').on("click", "#refresh", $.proxy(function () { this.getBatches(); return false; }, this));

        $('body').on("click", "#add", $.proxy(function () { this.AddSourceType(); return false; }, this));
        $('body').on("click", "#delete", $.proxy(function () { this.DeleteRecord(); return false; }, this));

        
        // if (isActive == '1') {
        //     this.getBatches();
        // }
    },
    
    getBatches: function () {

        var params = {};

        params[0] = String($('#txtDescription').val());
        params[1] = '0';
        params[2] = '30';
        params[3] = 'TimeRun';

        this.ancUtils.twaGetJSON(this.DEFAULT_BATCHSELECT_URL, params, $.proxy(this.processData, this));

       
        return false;
    },

    processData: function (data) {

        var tableBody = '';

        var selectEvents = [];
        var _idx = 0;
        var that = this;
        var gDateTime = new GDateTime();

        var batchContents = [];

        $.each(data.batchContents, function (source, sourceInfo) {
            
            var rowObj ={
                id :sourceInfo.Id,
                idx :_idx,
                column1 : {
                    isLink :true,
                    ref : sourceInfo.Ref
                },
                column2 : {
                    isLink :false,
                    ref : gDateTime.getDateFromDOTNet(sourceInfo.TimeRun).toUTCString()
                },
                column3 : {
                    isLink :false,
                    ref : sourceInfo.IsDeleted
                },
                column4 : {
                    isLink :true,
                    ref : 'View Records'
                },
                column5 : {
                    isLink :true,
                    ref : 'Delete Records'
                }
            };
            
            // var jDate = gDateTime.getDateFromDOTNet(sourceInfo.TimeRun);
         
            // var hidPID = '<input type="hidden" name="RowId" id="RowId" value ="' + sourceInfo.Id + '"/>';


            // var arIdx = jQuery.inArray(sourceInfo.Id, this.selection);

            // if (arIdx >= 0) {
            //     tableBody += '<tr class = "highLightRow">' + hidPID;
            // }
            // else {
            //     tableBody += '<tr>' + hidPID;
            // }

            //var _loc = window.location.hash;
            //_loc = that.qryStrUtils.updateStrForQry(_loc, 'id', sourceInfo.Id);

            // tableBody += '<td><a id= "s' + _idx + '" href="" ><div>' + sourceInfo.Ref + '</div></a></td>';
            // selectEvents.push({ key: 's' + _idx, value: sourceInfo.Id });

            // tableBody += '<td><div>' + jDate.toUTCString(); + '</div></td>';
            // tableBody += '<td><div>' + sourceInfo.IsDeleted + '</div></td>';
            // tableBody += '<td><a href ><div> View Records </div></a></td>';
            // tableBody += '<td><a href ><div> Delete Records </div></a></td>';

            // tableBody += '</tr>';
            _idx++;
            batchContents.push(rowObj);
        });


        var makeColumn = function(idx,id, isLink, ref, evtCollection ){
            
            var col = '';
            
            if(evtCollection && isLink){
                col = '<td><a id= "s' + idx + '" href="" ><div>' + ref + '</div></a></td>';
                evtCollection.push({ key: 's' + idx, value: id });
                return col;
            }
            
            if(isLink){
                col = '<td><a href ><div>' + ref + '</div></a></td>';
            }
            else
            {
                col = '<td><div>' + ref + '</div></td>';
            }
            
            return col;
        };

        var makeRow = function(rowData){
            
            var tableRow = '';
            
            var hidPID = '<input type="hidden" name="RowId" id="RowId" value ="' + rowData.id + '"/>';

            var arIdx = jQuery.inArray(rowData.id, this.selection);

            if (arIdx >= 0) {
                tableRow += '<tr class = "highLightRow">' + hidPID;
            }
            else {
                tableRow += '<tr>' + hidPID;
            }


            var _loc = window.location.hash;
            _loc = that.qryStrUtils.updateStrForQry(_loc, 'id', rowData.id);

            
            tableRow += makeColumn(rowData.idx, rowData.id, rowData.column1.isLink, rowData.column1.ref,selectEvents);
            tableRow += makeColumn(rowData.idx, rowData.id, rowData.column2.isLink, rowData.column2.ref);
            tableRow += makeColumn(rowData.idx, rowData.id, rowData.column3.isLink, rowData.column3.ref);
            tableRow += makeColumn(rowData.idx, rowData.id, rowData.column4.isLink, rowData.column4.ref);
            tableRow += makeColumn(rowData.idx, rowData.id, rowData.column5.isLink, rowData.column5.ref);
            
            tableRow += '</tr>';
            
            return tableRow;
        };

        $.each(batchContents, function (index, value) {
            tableBody += makeRow(value);  
        });

        if (tableBody !== '') {

            $('#search_bdy').html(tableBody);
            //create pager based on results


            var pagerparams = { ParentElement: 'pager',
                Batch: data.Batch,
                BatchLength: data.BatchLength,
                Total: data.Total,
                Function: this.getLink,
                Context: this
            };

            this.pager.createpager(pagerparams);

            $('#reccount').html(data.Total + ' Batches');
        }
        else {

            $('#search_bdy').html(tableBody);
            $('#reccount').html('0 Batches');
        }

        this.selectorTools.addlinks(selectEvents, this.processSelect, this);
    },
    processSelect: function (evt) {
        this.selectorTools.handleSelection(evt, this.selection, '#search_bdy tr', "#RowId");
    },
    sort: function (sort_col) {
        this.qryStrUtils.sort_inner(sort_col);
        this.getBatches();
    },
    getLink: function (toPage) {
        this.qryStrUtils.updateQryPar('page', toPage);
        this.getBatches();
    },
    
    DeleteBatch: function () {
        this.postParams.url = this.DEFAULT_REMOVEBATCH_URL;
        this.postParams.data = { batchId: this.qryStrUtils.convertToCSV(this.selection) };
        this.ancUtils.twaPostJSON(this.postParams);
    },
    ImportPersons: function () {
        this.postParams.url = this.DEFAULT_INSERTPERSONS_URL;
        this.postParams.data = { sheetUrl: this.qryStrUtils.convertToCSV(this.selection) };
        this.ancUtils.twaPostJSON(this.postParams);
    },
    ImportMarriages: function () {
        this.postParams.url = this.DEFAULT_INSERTMARRIAGES_URL;
        this.postParams.data = { sheetUrl: this.qryStrUtils.convertToCSV(this.selection) };
        this.ancUtils.twaPostJSON(this.postParams);
    },
    ImportParishs: function () {
        this.postParams.url = this.DEFAULT_INSERTPARISHS_URL;
        this.postParams.data = { sheetUrl: this.qryStrUtils.convertToCSV(this.selection) };
        this.ancUtils.twaPostJSON(this.postParams);
    },
    ImportSources: function () {
        this.postParams.url = this.DEFAULT_INSERTSOURCES_URL;
        this.postParams.data = { sheetUrl: this.qryStrUtils.convertToCSV(this.selection) };
        this.ancUtils.twaPostJSON(this.postParams);
    }

}


