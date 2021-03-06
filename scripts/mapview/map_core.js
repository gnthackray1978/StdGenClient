var JSMaster, QryStrUtils, AncUtils, google, MapParishs, MapSources;


// $(document).ready(function () {

//     var jsMaster = new JSMaster();
//     var headersection = '';

//     headersection += '<div id="fb-root">';
//     headersection += '<fb:login-button autologoutlink="true" &nbsp;perms="email,user_birthday,status_update,publish_stream"></fb:login-button>';
//     headersection += '</div>';

//     $('#1').html(headersection);

//     jsMaster.connectfacebook(function () {
//         var generalMap = new GeneralMap();
//         generalMap.init();

//     });

// });

var GeneralMap = function () {
    this.DEFAULT_PARISHTYPES_URL = '/ParishService/GetParishsTypes';
    this.DEFAULT_PARISHLOCATIONS_URL = '/ParishService/GetParishsFromLocations';
    this.DEFAULT_PARISHDETAILS_URL = '/ParishService/GetParishDetails';
    this.DEFAULT_PARISHSEARCH_URL = '/ParishService/GetSearchResults';

    this.DEFAULT_CHURCHICON_URL = '../Images/icons/32x32/church_symbol2.png';
    this.DEFAULT_ALTCHURCHICON_URL = '../Images/icons/icon_church.gif';

    this.qryStrUtils = new QryStrUtils();
    this.ancUtils = new AncUtils();
    this.mapParishs = new MapParishs();
    this.mapSources = new MapSources();
    this.infoWindows = [];
    this.zoomLevel = 0;
    this.map = null;
    this.markersArray = [];
    
    this.downloadedArea = [];
    this.displayedMarker = [];




    this.postParams = {

        url: '',
        data: '',
        idparam: 'id',
        refreshmethod: this.load,
        refreshArgs: undefined,
        Context: this
    };
};



GeneralMap.prototype = {

    init: function (selectorid, readyfunction) {


        var that = this;
        var latLng = new google.maps.LatLng(53.957700, -1.082290);
        var homeLatLng = new google.maps.LatLng(53.957700, -1.082290);

        var parishId = this.qryStrUtils.getParameterByName('pid');
        var cx = this.qryStrUtils.getParameterByName('cx');
        var cy = this.qryStrUtils.getParameterByName('cy');

        if (cx != null && cy != null) {
            latLng = new google.maps.LatLng(cx, cy);
        }


        // geocoder = new google.maps.Geocoder();
        var mapDiv = document.getElementById('map_canvas');

        this.map = new google.maps.Map(mapDiv, {
            center: latLng,
            zoom: 12
            ,
            mapTypeId: 'Border View',
            draggableCursor: 'pointer',
            draggingCursor: 'pointer',

            mapTypeControlOptions: { mapTypeIds: ['Border View'] },

            zoomControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.LARGE,
                position: google.maps.ControlPosition.TOP_RIGHT
            },

            panControl: true,
            panControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT
            }
        });
        this.setMapDetail();
        
        google.maps.event.addListener(this.map, 'dragend', $.proxy(this.DrawMap, this));

        google.maps.event.addListener(this.map, 'zoom_changed', $.proxy(this.DrawMap, this));
     
        $('body').on("click","#getStatus", $.proxy(this.getStatus, this)); 

        $('body').on("click","#locateParish", $.proxy(this.locateParish, this));
        
        this.ancUtils.twaGetJSON(this.DEFAULT_PARISHTYPES_URL, undefined, 
            function(data){
                that.mapParishs.loadParishTypes(data);
                that.DrawMap();
            });
    },

    DrawMap: function () {


        if (this.zoomLevel != this.map.getZoom()) {
            var that = this;
            $.each(this.infoWindows, function (key, value) {
                that.infoWindows[key].isopen = 0;
            });
        }

        this.zoomLevel = this.map.getZoom();
        
        console.log('map zoom: ' + this.zoomLevel);

        if (this.zoomLevel < 12) {
            this.deleteOverlays();
        }
        else {
            var bounds = this.map.getCenter();
            var newLocation = this.MakeLocation(bounds.lat(), bounds.lng());
            if (newLocation != "") {
                this.loadParish(newLocation);
            }
        }
        //  trimMarkers();


    },

    loadParish: function (locats) {
        
        var params = {};

        if (locats == '') {
            params[0] = '53.957700,-1.082290,0.5,0.5';
        }
        else {
            params[0] = locats;
        }

        this.ancUtils.twaGetJSON(this.DEFAULT_PARISHLOCATIONS_URL, params,
            $.proxy(this.parishResults, this)

        );


    },

    parishResults: function (data) {

        var tableBody = '';
        var visibleRecords = [];


        var parishId = this.qryStrUtils.getParameterByName('pid', '');
        var parishName = this.qryStrUtils.getParameterByName('pname', '');
        var parishMarker = null;

        var that = this;

        $.each(data, function (source, sourceInfo) {

            if (that.displayedMarker.indexOf(sourceInfo.ParishName) < 0) {

                var homeLatLng = new google.maps.LatLng(sourceInfo.ParishX, sourceInfo.ParishY);

                var image = that.DEFAULT_CHURCHICON_URL;
                var marker = new google.maps.Marker({
                    position: homeLatLng,
                    map: that.map,
                    icon: image,
                    title: sourceInfo.ParishName
                });

                marker.set("id", sourceInfo.ParishId);

                if (sourceInfo.ParishId == parishId) {
                    parishMarker = marker;
                }

                google.maps.event.addListener(marker, 'click', $.proxy(function () { that.createInfoWindowContent(sourceInfo.ParishId, sourceInfo.ParishName, marker); }, that)); //end click

                that.markersArray.push(marker);
                that.displayedMarker.push(sourceInfo.ParishName);

            }

        });    //end each


        if (parishId != '' &&
                parishId != null &&
                parishMarker != null) {

            $.proxy(function () { this.createInfoWindowContent(parishId, parishName, parishMarker); }, this);

        }




    },

    createInfoWindowContent: function (parishId, parishName, marker) {

        var params = {};
        params[0] = parishId;
       
        var infowindowloaded = 0;

        //basically cache what we've already downloaded
        // we have a array of downloaded info window content

        var that = this;

        $.each(this.infoWindows, function (key, value) {

            // we have downloaded this one before
            if (value.pid == parishId) {
                if (value.isopen == 0) {
                    that.infoWindows[key].isopen = 1;
                    var infowindow = new google.maps.InfoWindow({
                        content: value.infowindow
                    });

                    infowindow.open(that.map, marker);

                    var idx = key;

                    google.maps.event.addListener(infowindow, 'closeclick', $.proxy(
                    function () {
                        that.qryStrUtils.updateQryPar('pid', '');
                        that.infoWindows[idx].isopen = 0;

                    }, that)
                     );
                }
                infowindowloaded = 1;
            }

        });



        if (infowindowloaded == 0) {
            this.ancUtils.twaGetJSON(this.DEFAULT_PARISHDETAILS_URL, params, $.proxy(function (result) {



                var bounds = this.map.getBounds();
                var centre = bounds.getCenter();
                this.qryStrUtils.updateQryPar('cx', centre.lat());
                this.qryStrUtils.updateQryPar('cy', centre.lng());
                this.qryStrUtils.updateQryPar('pid', parishId);

                var headersection = '';

                headersection += '<div id="' + parishId + '" class = "info_cont">';

                headersection += '<div class = "title">' + parishName + ' </div>';
                headersection += '<div class = "tabhed">';
                headersection += '<a id = "' + parishId + 'tra" href="" ><span>Transcripts</span></a>';
                headersection += '<a id = "' + parishId + 'reg" href="" ><span>Registers</span></a>';
                headersection += '<a id = "' + parishId + 'sou" href="" ><span>Sources</span></a>';
                headersection += '</div>';

                headersection += '<div id="panelA'+ parishId+'" class = "displayPanel">';
                headersection += '<div class = "mtrlnk">';
                headersection += this.mapParishs.generateTranscripts(result.serviceParishTranscripts);
                headersection += '</div>';
                headersection += '</div>';

                headersection += '<div id="panelB'+ parishId+'" class = "hidePanel">';
                headersection += '<div class = "mtrlnk">';
                headersection += this.mapParishs.generateRegisters(result.serviceParishRecords);
                headersection += '</div>';
                headersection += '</div>';

                headersection += '<div id="panelC'+ parishId+'" class = "hidePanel">';
                headersection += '<div class = "mtrlnk">';
                headersection += this.mapSources.generateSources(result.serviceServiceMapDisplaySource, parishId, parishName, result.MarriageCount, result.PersonCount);
                headersection += '</div>';
                headersection += '</div>';
                headersection += '</div>'; //end container

                var panels = new Panels();

                $('body').on("click", '#' + parishId + 'tra', $.proxy(function () { 
                    $('#panelA'+ parishId).removeClass("displayPanel").addClass("hidePanel");
                    $("#panelB"+ parishId).removeClass("displayPanel").addClass("hidePanel");
                    $("#panelC"+ parishId).removeClass("hidePanel").addClass("displayPanel");
                    return false; 
                    
                }, panels));
                
                $('body').on("click", '#' + parishId + 'reg', $.proxy(function () { 
                    $("#panelA"+ parishId).removeClass("displayPanel").addClass("hidePanel");
                    $("#panelB"+ parishId).removeClass("hidePanel").addClass("displayPanel");
                    $("#panelC"+ parishId).removeClass("displayPanel").addClass("hidePanel");
                    return false; 
                    
                }, panels));
                
                $('body').on("click", '#' + parishId + 'sou', $.proxy(function () { 
                    $("#panelA"+ parishId).removeClass("hidePanel").addClass("displayPanel");
                    $("#panelB"+ parishId).removeClass("displayPanel").addClass("hidePanel");
                    $("#panelC"+ parishId).removeClass("displayPanel").addClass("hidePanel"); 
                    return false; 
                    
                }, panels));


                var infowindow = new google.maps.InfoWindow({
                    content: headersection
                });


                infowindow.open(this.map, marker);

                var infowindowentry = {};

                infowindowentry.pid = parishId;
                infowindowentry.isopen = 1;
                infowindowentry.infowindow = headersection;

                var idx = this.infoWindows.push(infowindowentry);

                google.maps.event.addListener(infowindow, 'closeclick',
                            $.proxy(function () {
                                this.qryStrUtils.updateQryPar('pid', '');
                                this.infoWindows[idx - 1].isopen = 0;
                            }, this)
                        );
                panels.masterShowTab(1);
            }
            , this));
            //this.ancUtils.twaGetJSON('/ParishService/GetParishDetails', params, fresult);
        }
    },

    MakeSquareCSV: function (_rec) {

        var locationString = "";

        for (var i = 0; i < _rec.length; i++) {
            locationString += "," + _rec[i].latx + "," + _rec[i].laty + "," + _rec[i].boxlen;
        }

        if (locationString != "")
            locationString = locationString.slice(1);

        return locationString;

    },

    MakeLocation: function (latx, laty) {


        //List<RectangleD> newArea = new List<RectangleD>();
        var newArea = new Array();

        //double latx = 53.957700;
        // double laty = -1.082290;
        var XIdx = 0;
        var YIdx = 0;
        var xcount = 10;
        var ycount = 10;

        var boxlen = 0.1;

        latx = (Math.round(latx * 10) / 10) - boxlen * (xcount / 2);
        laty = (Math.round(laty * 10) / 10) - boxlen * (ycount / 2);

        var startx = latx;
        while (YIdx < ycount) {
            XIdx = 0;

            latx = startx;

            while (XIdx < xcount) {
                latx = Math.round(latx * 100) / 100
                laty = Math.round(laty * 100) / 100
                var _rec = {
                    latx: latx,
                    laty: laty,
                    boxlen: boxlen
                }
                if (!this.downloadedArea.ContainsRec(_rec)) {
                    this.downloadedArea.push(_rec);
                    newArea.push(_rec);
                }
                else {
                    // console.log('downloaded');
                }
                latx += 0.1;
                XIdx++;
            }
            laty += 0.1;
            YIdx++;
        }

        // var idx=0;
        
        // while(idx < newArea.length){
            
        //     // are 2 areas adjacent
            
            
            
        //     var rightAdj = ((newArea[idx].latx + newArea[idx].boxlen) == newArea[idx + 1].latx);
            
            
        //     idx++;
        // }

        //   Debug.WriteLine("areas count: " + downloadedArea.Count);
        return this.MakeSquareCSV(newArea);
    },

    trimMarkers: function () {
        // this doesnt work!!!!
        // not called at the moment because it 
        // isnt necessary..

        var bounds = map.getBounds();
        if (bounds != undefined) {
            var nebounds = bounds.getNorthEast();
            var swbounds = bounds.getSouthWest();

            var bufferSize = 0.3;

            var leftbound = swbounds.Ra - bufferSize;
            var rightbound = nebounds.Ra + bufferSize;

            var topbound = nebounds.Qa + bufferSize;
            var bottombound = swbounds.Qa - bufferSize;

            if (this.markersArray) {

                var idx = 0;
                while (idx < this.markersArray.length) {

                    var latlong = this.markersArray[idx].getPosition();

                    if (this.markersArray[idx].labelContent == 'Rufforth') {
                        var test = 0;
                    }

                    if (latlong.Ra < leftbound || latlong.Ra > rightbound ||
                            latlong.Qa > topbound || latlong.Qa < bottombound) {
                        this.markersArray[idx].setMap(null);

                        var label = this.markersArray[idx].labelContent;
                        //remove relavent entry in displayedmarkers array
                        this.displayedMarker.splice(displayedMarker.indexOf(label), 1);
                        //remove marker entry in markers array
                        this.markersArray.splice(idx, 1);
                    }
                    else {
                        idx++;
                    }
                }

            }

            if (this.downloadedArea) {
                // cycle through the downloaded areas
                // and remove any that we've got rid of

                //laty
                //50 top

                //40 bottom
                var idx = 0;
                while (idx < this.downloadedArea.length) {

                    var blat = (this.downloadedArea[idx].laty - this.downloadedArea[idx].boxlen);
                    var blng = (this.downloadedArea[idx].latx + this.downloadedArea[idx].boxlen);

                    if (this.downloadedArea[idx].latx < leftbound || blng > rightbound || this.downloadedArea[idx].laty > topbound || blat < bottombound) {

                        this.downloadedArea.splice(idx, 1);
                    }
                    else {
                        idx++;
                    }
                }
            }
        }
    },
    // Deletes all markers in the array by removing references to them
    deleteOverlays: function () {

        if (this.markersArray) {

            var idx = 0;
            while (idx < this.markersArray.length) {
                this.markersArray[idx].setMap(null);
                idx++;
            }

            this.markersArray.length = 0;
        }

        this.displayedMarker = [];
        this.downloadedArea = [];

    },

    setMapDetail: function () {

        var styleOff = [{ visibility: 'off'}];
        var styleOn = [{ visibility: 'on'}];
        var stylez = [
          { featureType: 'administrative',
              elementType: 'labels',
              stylers: styleOn
          },
            { featureType: 'transit.line',
                elementType: 'geometry',
                stylers: styleOff
            },
            { featureType: 'transit.station.airport',
                elementType: 'geometry',
                stylers: styleOff
            },
          { featureType: 'administrative.province',
              stylers: styleOff
          },
          { featureType: 'administrative.locality',
              stylers: styleOn
          },
          { featureType: 'administrative.neighborhood',
              stylers: styleOn
          },

          { featureType: 'administrative.land_parcel',
              stylers: styleOn
          },

          { featureType: 'poi',
              stylers: styleOff
          },

          { featureType: 'landscape',
              stylers: styleOn
          },

          { featureType: 'landscape.natural',
              stylers: styleOn
          },

          { featureType: 'road',
              stylers: styleOn
          }
          ];

        var customMapType = new google.maps.StyledMapType(stylez,
                { name: 'Border View' });

        this.map.mapTypes.set('Border View', customMapType);
    },

    getStatus: function () {
        var qryString = '';
        var i = 0;

        var params = {};
        params[0] = 'YORKSHIRE';
        params[1] = $('#txtDateLower').val();
        params[2] = $('#txtDateUpper').val();

        //        $.ajaxSetup({ cache: false });
        //        $.getJSON(url, params, processSearchResults);

        var processSearchResults = function (data) {
            var idx = 0;
            $.each(data, function (source, sourceInfo) {
                var markerIdx = 0;
                while (markerIdx < this.markersArray.length) {
                    var _id = this.markersArray[markerIdx].get('id');
                    if (_id == sourceInfo.ParishId) {
                        this.markersArray[markerIdx].setIcon(this.DEFAULT_ALTCHURCHICON_URL);
                        break;
                    }

                    markerIdx++;
                }

                idx++;
            });
        }

        this.ancUtils.twaGetJSON(this.DEFAULT_PARISHSEARCH_URL, params, processSearchResults);



    },

    locateParish: function () {

        var address = $('#txtLocation').val(); //  document.getElementById("address").value;

        address += ',' + $('#txtCounty').val();

        geocoder.geocode({ 'address': address }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                map.setZoom(14);
            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });

    }
}
 