var JSMaster,QryStrUtils,AncUtils,Panels;

var AncPersons = function () {
    this.tableMaker = new TableMaker();
    this.qryStrUtils = new QryStrUtils();
    this.ancUtils = new AncUtils();
   
    this.DEFAULT_PERSONSELECT_URL = '/PersonService/Get/Select';
    this.DEFAULT_PERSONDELETE_URL = '/PersonService/Delete';
    this.DEFAULT_PERSONASSIGNLOCATS_URL = '/PersonService/AssignLocats';
    this.DEFAULT_PERSONSETDUPES_URL = '/PersonService/SetDuplicate';
    this.DEFAULT_PERSONUPDATEDATES_URL = '/PersonService/UpdateDates';
    this.DEFAULT_PERSONREMOVELINKS_URL = '/PersonService/RemoveLinks';
    this.DEFAULT_PERSONMERGE_URL = '/PersonService/MergePersons';
    this.DEFAULT_SETSOURCE_URL = '/Sources/AddPersonTreeSource';
    this.DEFAULT_REMOVESOURCE_URL = '/Sources/RemoveTreeSources';

    this.DEFAULT_SOURCESELECT_URL = '/Sources/Select';
    this.DEFAULT_PERSONEDITOR_URL = '../HtmlPages/PersonEditor.html';
    this.DEFAULT_SOURCEEDITOR_URL = '../HtmlPages/SourceEditor.html';
    this.DEFAULT_MARRIAGEEDITOR_URL = '../HtmlPages/MarriageEditor.html';
    
    this.parishId = '';
    this.sourceIds = '';

    this.postParams = {
        url: '',
        data: '',
        idparam: undefined,
        refreshmethod: this.getPersons,
        refreshArgs: ['1'],
        Context: this
    };
};



AncPersons.prototype = {

    init: function () {
        var isActive = this.qryStrUtils.getParameterByName('active', '');


        var panels = new Panels();

        $('body').on("click", "#main", $.proxy(function () { panels.sourcesShowPanel('1'); return false; }, panels));
        $('body').on("click", "#more", $.proxy(function () { panels.sourcesShowPanel('2'); return false; }, panels));
        $('body').on("click", "#refresh", $.proxy(function () { this.getPersons("0"); return false; }, this));
        $('body').on("click", "#add", $.proxy(function () { this.addPerson('00000000-0000-0000-0000-000000000000'); return false; }, this));
        $('body').on("click", "#delete", $.proxy(function () { this.DeleteRecord(); return false; }, this));
        $('body').on("click", "#print", $.proxy(function () { this.PrintableResults(); return false; }, this));
        $('body').on("click", "#asslocs", $.proxy(function () { this.AssignLocations(); return false; }, this));
        $('body').on("click", "#dupes", $.proxy(function () { this.SetDuplicates(); return false; }, this));
        $('body').on("click", "#upests", $.proxy(function () { this.UpdateEstimates(); return false; }, this));
        $('body').on("click", "#remove-trees", $.proxy(function () { this.RemoveSources(); return false; }, this));
        $('body').on("click", "#add-tree", $.proxy(function () { this.SetSources(); return false; }, this));
        
        $('body').on("click", "#remove", $.proxy(function () { this.SetRemoveLink(); return false; }, this));
        $('body').on("click", "#merge", $.proxy(function () { this.SetMergeSources(); return false; }, this));
        $('body').on("click", "#sbint", $.proxy(function () { this.sort('BirthInt'); return false; }, this));
        $('body').on("click", "#sdint", $.proxy(function () { this.sort('DeathInt'); return false; }, this));

        $('body').on("click", "#sbloc", $.proxy(function () { this.sort('BirthLocation'); return false; }, this));
        $('body').on("click", "#sname", $.proxy(function () { this.sort('ChristianName'); return false; }, this));

        $('body').on("click", "#ssurname", $.proxy(function () { this.sort('Surname'); return false; }, this));

        $('body').on("click", "#sfather", $.proxy(function () { this.sort('FatherChristianName'); return false; }, this));
        $('body').on("click", "#smother", $.proxy(function () { this.sort('MotherChristianName'); return false; }, this));
        $('body').on("click", "#sinfo", $.proxy(function () { this.sort('SourceRef'); return false; }, this));


        if (isActive == '1') {
            $('#txtCName').val(this.qryStrUtils.getParameterByName('cname', ''));
            $('#txtSName').val(this.qryStrUtils.getParameterByName('sname', ''));
            $('#txtFCName').val(this.qryStrUtils.getParameterByName('fcname', ''));
            $('#txtFSName').val(this.qryStrUtils.getParameterByName('fsname', ''));
            $('#txtMCName').val(this.qryStrUtils.getParameterByName('mcname', ''));
            $('#txtMSName').val(this.qryStrUtils.getParameterByName('msname', ''));
            $('#txtLocation').val(this.qryStrUtils.getParameterByName('locat', ''));
            $('#txtCounty').val(this.qryStrUtils.getParameterByName('count', ''));
            $('#txtLowerDateRangeLower').val(this.qryStrUtils.getParameterByName('ldrl', ''));
            $('#txtLowerDateRangeUpper').val(this.qryStrUtils.getParameterByName('ldru', ''));

            if (this.qryStrUtils.getParameterByName('inct', '') == 'false') {
                $('#chkIncludeTree').prop('checked', false);
            }
            else {
                $('#chkIncludeTree').prop('checked', true);
            }


            if (this.qryStrUtils.getParameterByName('incb', 'false') == 'false') {
                $('#chkIncludeBirths').prop('checked', false);
            }
            else {
                $('#chkIncludeBirths').prop('checked', true);
            }


            if (this.qryStrUtils.getParameterByName('incd', 'false') == 'false') {
                $('#chkIncludeDeaths').prop('checked', false);
            }
            else {
                $('#chkIncludeDeaths').prop('checked', true);
            }
            

            if (this.qryStrUtils.getParameterByName('incs', '') == 'false') {
                $('#chkIncludeSources').prop('checked', false);
            }
            else {
                $('#chkIncludeSources').prop('checked', true);
            }
            

            this.parishId = this.qryStrUtils.getParameterByName('parid', '');
            this.sourceIds = this.qryStrUtils.getParameterByName('sids', '');
            console.log('person calling get data');
            this.getPersons('1');
        }

        
        this.getSources();
        

     //'remove-trees'  
                   
         //         'add-tree' 
    },

    createQryString: function () {

        var args = {
            "active": '1',
            "cname": $('#txtCName'),
            "sname": $('#txtSName'),
            "fcname": $('#txtFCName'),
            "fsname": $('#txtFSName'),
            "mcname": $('#txtMCName'),
            "msname": $('#txtMSName'),
            "locat": $('#txtLocation'),
            "count": $('#txtCounty'),
            "ldrl": $('#txtLowerDateRangeLower'),
            "ldru": $('#txtLowerDateRangeUpper'),
            "inct": $('#chkIncludeTree').prop('checked'),
            "incb": $('#chkIncludeBirths').prop('checked'),
            "incd": $('#chkIncludeDeaths').prop('checked'),
            "incs": $('#chkIncludeSources').prop('checked'),
            "parid": this.parishId,
            "sids":this.sourceIds
        };


        this.qryStrUtils.updateQry(args);
    },

    getPersons: function (showdupes) {

        var params = {};
        var parentId = '';

        if (showdupes == '0') {
            this.qryStrUtils.updateQryPar('_parentId', parentId);
        }
        else {
            parentId = this.qryStrUtils.getParameterByName('_parentId', '');
        }

        params[0] = parentId;
        params[1] = String($('#txtCName').val());
        params[2] = String($('#txtSName').val());
        params[3] = String($('#txtFCName').val());
        params[4] = String($('#txtFSName').val());
        params[5] = String($('#txtMCName').val());
        params[6] = String($('#txtMSName').val());

        params[7] = String($('#txtLocation').val());
        params[8] = String($('#txtCounty').val());

        params[9] = String($('#txtLowerDateRangeLower').val());
        params[10] = String($('#txtLowerDateRangeUpper').val());

        params[11] = String($('#chkIncludeTree').prop('checked'));
        params[12] = String($('#chkIncludeBirths').prop('checked'));
        params[13] = String($('#chkIncludeDeaths').prop('checked'));
        params[14] = String($('#chkIncludeSources').prop('checked'));
        params[15] = this.sourceIds;
        params[16] = String($('#txtSpouse').val());
        params[17] = this.parishId;
        params[18] = String(this.qryStrUtils.getParameterByName('page', 0));
        params[19] = '30';
        params[20] = String(this.qryStrUtils.getParameterByName('sort_col', 'BirthInt'));

        this.ancUtils.twaGetJSON(this.DEFAULT_PERSONSELECT_URL, params, $.proxy(this.processData, this));

        this.createQryString();

        return false;
    },

    processData: function (data) {
      
        var that = this;

        var tableData = {
            column1Func : function(evt, idx, parentId){
                console.log('hello1');
                that.loadDupes(parentId);
            },
            column4Func : function(){console.log('hello4');},
            column5Func : function(){console.log('hello5');},
            rows : []
        }; 

        $.each(data.servicePersons, function (idx, value) {
            var _path = window.location.hash;
            _path = that.qryStrUtils.updateStrForQry(_path, 'id', value.PersonId);
            var _sourcePath = window.location.hash;
            _sourcePath = that.qryStrUtils.updateStrForQry(_sourcePath, 'id', value.SourceId);
            
            var _marriagePath = window.location.hash;
            _marriagePath = that.qryStrUtils.updateStrForQry(_marriagePath, 'id', value.MarriageId);
            
            var _dateStr ='';
            var _loc ='';
            var _father = value.FatherChristianName;
            var _mother ='';
            
            
            
            if (value.SourceDateStr != ''){
                _dateStr = value.SourceDateStr;
            }
            if( value.ReferenceYear !=0){
                _dateStr = value.ReferenceYear;
            }
            if( value.BirthYear !=0 || value.DeathYear !=0){
                _dateStr = value.BirthYear + '-' + value.DeathYear;
            }
            
            if (value.SourceParishName != '') {
                _loc = value.SourceParishName;
            }
            
            if (value.ReferenceLocation != '') {
                _loc = value.ReferenceLocation;
            }
            
            
            if (value.DeathLocation != '' || value.BirthLocation != '') {
                if (value.DeathLocation == ''){
                    _loc = value.BirthLocation;
                } else {
                    _loc = value.BirthLocation + ' -> '+value.DeathLocation;
                }
            }
               
                
            if (value.Spouse != ''){
                _father = value.Spouse;
            }
            
            if(value.MotherChristianName == ''){
                _mother = value.OtherSide == undefined ? '' : value.OtherSide;    
            }
            else
            {
                _mother = value.MotherChristianName;   
            }
            
            var c11Ref , c11Href;
            
            if (value.MarriageId != '00000000-0000-0000-0000-000000000000'){
                c11Ref = 'Marriage';
                c11Href = that.DEFAULT_MARRIAGEEDITOR_URL+_marriagePath;
            }
            else
            {
                c11Ref = value.SourceRef;
                c11Href = that.DEFAULT_SOURCEEDITOR_URL+_sourcePath;
            }
            
            var rowObj = {
                id :value.PersonId,
                parentId :value.UniqueReference,
                idx : idx,
                column1 : {
                    isLink :true,
                    ref : value.Events
                },
                column2 : {
                   isLink :true,
                    href : that.DEFAULT_PERSONEDITOR_URL+_path,
                    ref : 'Edit'
                },
                column3 : {
                    isLink :false,
                    className : 'dates',
                    ref : _dateStr
                },
                column4 : {
                    isLink :false,
                    ref : _loc
                },
                column5 : {
                    isLink :true,
                    key :true,
                    ref : value.ChristianName,
                    href :''
                },
                column6 : {
                    isLink :false,
                    title : value.LinkedTrees == '' ? '' : value.LinkedTrees,
                    ref : value.Surname,
                    className : value.LinkedTrees == '' ? '' : 'associatedTrees'
                },
                column7 : {
                    isLink :false,
                    ref : _father,
                    className : value.Spouse == '' ? 'parent' : 'spouse'
                },
                column8 : {
                    isLink :false,
                    ref : _mother 
                },
                column9 : {
                    isLink :false,
                    ref : value.MotherSurname 
                },
                column10 : {
                    isLink :true,
                    ref : c11Ref,
                    href : c11Href
                }
                
                
            };
            
            tableData.rows.push(rowObj);
        });

        var pagerparams = { ParentElement: 'pager',
            Batch: data.Batch,
            BatchLength: data.BatchLength,
            Total: data.Total,
            Function: this.getLink,
            Context: this
        };
        
        this.tableMaker.MakeBody(tableData,pagerparams);
    },

    getSources: function () {

        var params = {};
        params[0] = '87';
        params[1] = '';
        params[2] = '';
        params[3] = '';
        params[4] = '0';
        params[5] = '0';
        params[6] = '2000';
        params[7] = '2000';
        params[8] = '';
        params[9] = 'false';
        params[10] = 'false';
        params[11] = 'false';
        params[12] = 'false';
        params[13] = '0';
        params[14] = '30';
        params[15] = 'sdate';

        this.ancUtils.twaGetJSON(this.DEFAULT_SOURCESELECT_URL, params, function (data) {
            var tableBody = '';
            $.each(data.serviceSources, function (source, sourceInfo) {
                tableBody += '<option value="' + sourceInfo.SourceId + '">' + sourceInfo.SourceRef + '</option>';
            });
            if (tableBody !== '') $('#tree-select').html(tableBody);
        });

        return false;
    },

    loadDupes: function (parentId) {
        this.qryStrUtils.updateQryPar('_parentId', parentId);
        this.getPersons('1');
    },

    getLink: function (toPage) {
        this.qryStrUtils.updateQryPar('page', toPage);
        this.getPersons('1');
    },

    sort: function (sort_col) {
        this.qryStrUtils.sort_inner(sort_col);
        this.getPersons('1');
    },

    addPerson: function (path) {
        window.location.href = this.DEFAULT_PERSONEDITOR_URL + '#' + this.qryStrUtils.makeIdQryString('id', path);
    },

    DeleteRecord: function () {
        this.postParams.url = this.DEFAULT_PERSONDELETE_URL;
        this.postParams.data = { personId: this.qryStrUtils.convertToCSV(this.tableMaker.selectedRows) };
        this.ancUtils.twaPostJSON(this.postParams);
    },

    PrintableResult: function () {

    },

    AssignLocations: function () {
        this.postParams.url = this.DEFAULT_PERSONASSIGNLOCATS_URL;
        this.ancUtils.twaPostJSON(this.postParams);
    },

    SetDuplicates: function () {
        this.postParams.url = this.DEFAULT_PERSONSETDUPES_URL;
        this.postParams.data = { persons: this.qryStrUtils.convertToCSV(this.tableMaker.selectedRows) };
        this.ancUtils.twaPostJSON(this.postParams);
    },

    UpdateEstimates: function () {
        this.ancUtils.twaGetJSON(this.DEFAULT_PERSONUPDATEDATES_URL, '', function () { });
    },

    SetRelation: function (relationid) {
        this.postParams.url = this.DEFAULT_PERSONSETDUPES_URL;
        this.postParams.data = { persons: this.qryStrUtils.convertToCSV(this.tableMaker.selectedRows), relationType: relationid };
        this.ancUtils.twaPostJSON(this.postParams);
    },

    SetRemoveLink: function () {
        this.postParams.url = this.DEFAULT_PERSONREMOVELINKS_URL;
        this.postParams.data = { person: this.qryStrUtils.convertToCSV(this.tableMaker.selectedRows)};
        this.ancUtils.twaPostJSON(this.postParams);
    },
    
    SetMergeSources: function(){
        this.postParams.url = this.DEFAULT_PERSONMERGE_URL;
        this.postParams.data = { person: this.qryStrUtils.convertToCSV(this.tableMaker.selectedRows) };
        this.ancUtils.twaPostJSON(this.postParams);
    },

    SetSources: function () {
        this.postParams.url = this.DEFAULT_SETSOURCE_URL;
        this.postParams.data = { record:this.qryStrUtils.convertToCSV(this.tableMaker.selectedRows),sources: $("#tree-select").val()};
        this.ancUtils.twaPostJSON(this.postParams);
    },

    RemoveSources: function () {
        this.postParams.url = this.DEFAULT_REMOVESOURCE_URL;
        this.postParams.data = { record: this.qryStrUtils.convertToCSV(this.tableMaker.selectedRows) };
        this.ancUtils.twaPostJSON(this.postParams);
    }

};
















