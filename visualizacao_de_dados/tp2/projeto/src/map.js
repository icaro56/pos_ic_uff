var Map = (function() {
    
    'use strict';
    
    var moduleExports = {};
    
    moduleExports.map = null;
    var features = null;
    var allMarkers = [];
    var activeZoomOption = -1;
    var activeDataTypeOption = 0;
    var activeQuantificationOption = 0;
    
    
    var colorScale = d3.scaleQuantize().domain([0, 100000]).range(colorbrewer.Oranges["8"]);
    
    var maxValue = 1000;
    //var totalValue = 0;
    var lastSelectedLength = 0;
    
    moduleExports.selectedCities = [];
    moduleExports.selectedRISPs = [];
    moduleExports.selectedAISPs = [];
    moduleExports.selectedDPs = [];
    
    moduleExports.legend = null;
    moduleExports.g = null;

    moduleExports.infowindow = new google.maps.InfoWindow();
    
    var clearMarkers = function(){
        for (var i = 0; i < allMarkers.length; i++) {
          allMarkers[i].setMap(null);
        }
    }
    
    var deleteMarkers = function() {
        clearMarkers();
        allMarkers = [];
    }

    moduleExports.setActiveDataTypeOption = function(opt) {
        activeDataTypeOption = opt;
        moduleExports.forceLoadMapByZoom(activeZoomOption);
    }
    
    moduleExports.setActiveQuantificationOption = function(opt) {
        activeQuantificationOption = opt;
        moduleExports.forceLoadMapByZoom(activeZoomOption);
    }
    
    moduleExports.updateLegend = function(newColorRange) {
        
        moduleExports.legend = moduleExports.g.selectAll(".legend")
                        .data(newColorRange);
                        //.enter().append("g")
                          //.attr("class", "legend")
                          //.attr("transform", function(d, i) { return "translate(" + (0) + "," + i * 21 + ")"; });

        moduleExports.legend.select("rect")
              //.attr("x", 0)
              //.attr("width", 20)
              //.attr("height", 20)
              .style("fill", function(d){return d;});
        
        moduleExports.legend.select("text")
              .text(function(d, index) 
                    { 
                        var ext = colorScale.invertExtent(d);
                        var fixedNum1 = 0;
                        var fixedNum2 = 0;
                        
                        if (ext[0] > 0 && ext[0] <= 1)
                            fixedNum1 = 5;
            
                        if (ext[1] > 0 && ext[1] <= 1)
                            fixedNum2 = 5;
                
                        return ext[0].toFixed(fixedNum1).toString() + " - " + ext[1].toFixed(fixedNum2).toString();
                    });
    }
    
    var createLegend = function() {
        var svg = d3.select("#legendDiv").append("svg")
                .attr("width", 150)
                .attr("height", 200);
        
        moduleExports.g = svg.append("g")
                .attr("id", "chart-area")
                .attr("width", 150)
                .attr("height", 200)
                .attr("transform", "translate( " + 0 + ", " + 0 + ")");
        
        
        
        moduleExports.legend = moduleExports.g.selectAll(".legend")
                        .data(colorbrewer.Oranges["8"])
                        .enter().append("g")
                          .attr("class", "legend")
                          .attr("transform", function(d, i) { return "translate(" + (0) + "," + i * 21 + ")"; });

        moduleExports.legend.append("rect")
              .attr("x", 0)
              .attr("width", 20)
              .attr("height", 20)
              .style("fill", function(d){return d;});

        moduleExports.legend.append("text")
              .attr("x", 25)
              .attr("y", 10)
              .attr("dy", ".35em")
              .style("text-anchor", "start")
              .style("font-size", "14px")
              .text(function(d, index) 
                    { 
                        var ext = colorScale.invertExtent(d);
                        var fixedNum1 = 0;
                        var fixedNum2 = 0;
                        
                        if (ext[0] > 0 && ext[0] <= 1)
                            fixedNum1 = 5;
            
                        if (ext[1] > 0 && ext[1] <= 1)
                            fixedNum2 = 5;
                
                        return ext[0].toFixed(fixedNum1).toString() + " - " + ext[1].toFixed(fixedNum2).toString();
                    });
    }
    
    var loadJSON = function(filename, callback) {   

        
        $.getJSON(filename).done(callback).fail(function(jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log( "Erro ao carregar arquivo de mapas: " );
            console.log( err );
        });
        
        /*var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', filename, true); 
        
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4) {
                if (xobj.status === 200) {
                    console.log("primeiro passo");
                    callback(xobj.responseText);
                }  
                else {
                    console.log("Problema de cross domain");
                }
            }
        };
        xobj.send(null);  */
    }
    
    var createEventsAndStyles = function(){
        //Código para recuperar a posição central de cada polígono
        moduleExports.map.data.addListener('addfeature',function(e){
            if(e.feature.getGeometry().getType() === 'Polygon' || e.feature.getGeometry().getType() === 'MultiPolygon'){
                var bounds = new google.maps.LatLngBounds();

                e.feature.getGeometry().forEachLatLng(
                    function(latlng){
                        bounds.extend(latlng);
                    }
                );

                e.feature.setProperty('bounds', bounds);
                e.feature.setProperty('center', bounds.getCenter());
                e.feature.setProperty('selected', false);
                
                var value = 0;
                if (activeZoomOption == 0) {
                    value = CrimeControl.queryRISP(e.feature.getProperty("RISP"), activeDataTypeOption);
                }
                else if (activeZoomOption == 1){
                    var cityName = e.feature.getProperty("name");
                    value = CrimeControl.queryCity(cityName, activeDataTypeOption);
                    
                    var pop = PopulationMap.getPopulationByMunicipio(cityName);
                    pop = (pop == undefined) ? 0 : pop;
                    e.feature.setProperty("estimatedCityPopulation", pop);
                    
                    if (activeQuantificationOption == 1) {
                        value = pop != 0 ? ((100*(value / pop)) / maxValue) : 0;
                        value = value.toFixed(2);
                    }
                }
                else if (activeZoomOption == 2){
                    var idBPM = e.feature.getProperty("AISP");
                    value = CrimeControl.queryAISP(idBPM, activeDataTypeOption);
                    
                    var pop = PopulationMap.getPopulationByBPM(idBPM);
                    pop = (pop == undefined) ? 0 : pop;
                    e.feature.setProperty("EstimatedBPMPopulation", pop);
                    
                    if (activeQuantificationOption == 1) {
                        value = pop != 0 ? ((100*(value / pop)) / maxValue) : 0;
                        value = value.toFixed(2);
                    }
                }
                else {
                    var dp = e.feature.getProperty("DP").split("ª")[0];
                    value = CrimeControl.queryDP(dp, activeDataTypeOption);
                }
                
                
                e.feature.setProperty('myColor', colorScale(parseFloat(value)));
                e.feature.setProperty('myValue', parseFloat(value));
                
                

                //descomentar para debug
                //new google.maps.Rectangle({map:moduleExports.map,bounds:bounds,clickable:false})
            }
        });
        
        //customização
        moduleExports.map.data.setStyle(function(feature) {
            //var color = 'gray';
            var color = feature.getProperty('myColor');
            var z = 1;
            var sW = 2;
            var sC = '#000000';
            
            if (feature.getProperty('selected')) {
                z = 2;
                sW= 4;
                sC = '#6c28ba';
            }
            return ({
                fillColor: color,
                fillOpacity: 1,
                strokeColor: sC,
                strokeWeight: sW,
                zIndex: z
            });
        });

        moduleExports.map.data.addListener('mouseover', function(event) {
            moduleExports.map.data.revertStyle();
            moduleExports.map.data.overrideStyle(event.feature, {strokeWeight: 8, zIndex: 3});
        });

        moduleExports.map.data.addListener('mouseout', function(event) {
            moduleExports.map.data.revertStyle();
        });

        //InfoBox
        moduleExports.map.data.addListener('click', function(event) {
            var selected = !event.feature.getProperty('selected');
            event.feature.setProperty('selected', selected);
            
            // pegando div para incluir informações de seleção
            var info = document.getElementById('infoMapDiv');
            
            if(selected)
            {
                var valueSelected = event.feature.getProperty('myValue');
                info.innerHTML  = "<p><strong>Selected item</strong></p>";
                info.innerHTML  += "Occurrences: " + valueSelected + "<br>";
            }
            else
                info.innerHTML  = "";
            
            var rispName = "";            
            if (activeZoomOption == 0) { // Grande área - RISP
                var idRisp = event.feature.getProperty("RISP");
                
                if (selected) {
                    rispName = RISPMap.getRispName(idRisp);
                                        
                    info.innerHTML += "<p><strong>Large Area: </strong>" + rispName;
                    
                    if (!Utils.listContains(moduleExports.selectedRISPs, idRisp))
                        moduleExports.selectedRISPs.push({id: idRisp, name: rispName});
                    
                } else {
                    Utils.listRemove(moduleExports.selectedRISPs, idRisp); 
                }
                
                if(moduleExports.selectedRISPs.length || lastSelectedLength) {
                    lastSelectedLength = moduleExports.selectedRISPs.length;
                    var result = CrimeControl.querySelecteds("RISP", moduleExports.selectedRISPs);
                    //console.log(result);
                    
                    SeriesControl.update(result, CrimeControl.timeWindow.isMonth);
                    
                    var barResult = CrimeControl.querySelectedsForHistogram("RISP", moduleExports.selectedRISPs);
                    console.log(barResult);
                    BarsControl.update(barResult);
                }
            }
            else if (activeZoomOption == 1){ // Municipio
                
                if (selected) {
                    var nomeMunicipio = event.feature.getProperty("name");
                    var municipioData = DPMap.getMunicipioInfos(nomeMunicipio);
                    municipioData.grandeArea = RISPMap.getRispName(municipioData.idRisp);
                    municipioData.populacao = PopulationMap.getPopulationByMunicipio(municipioData.municipio);
                    
                    info.innerHTML+= "<p><strong>County: </strong>" + municipioData.municipio;
                    info.innerHTML+= "<p><strong>Estimated Pop: </strong>" + municipioData.populacao;
                    info.innerHTML+= "<p><strong>Battalion: </strong>" + municipioData.bpm + "o.";
                    info.innerHTML+= "<p><strong>Large area: </strong>" + municipioData.grandeArea;
                    
                    if (!Utils.listContains(moduleExports.selectedCities, nomeMunicipio))
                        moduleExports.selectedCities.push({id: nomeMunicipio, name: nomeMunicipio});
        
                } else {
                    var nomeMunicipio = event.feature.getProperty("name");
                    
                    Utils.listRemove(moduleExports.selectedCities, nomeMunicipio);
                }
                
                if(moduleExports.selectedCities.length || lastSelectedLength) {
                    lastSelectedLength = moduleExports.selectedCities.length;
                    var result;
                    var barResult;
                    if (activeQuantificationOption == 0) {
                        result = CrimeControl.querySelecteds("Município", moduleExports.selectedCities);
                        barResult = CrimeControl.querySelectedsForHistogram("Município", moduleExports.selectedCities);
                    }
                    else {
                        result = CrimeControl.querySelectedsByPop("Município", moduleExports.selectedCities, maxValue);
                        barResult = CrimeControl.querySelectedsForHistogramByPop("Município", moduleExports.selectedCities, maxValue);
                    }
                    console.log(barResult);
                    SeriesControl.update(result, CrimeControl.timeWindow.isMonth);
                    BarsControl.update(barResult);
                }
            }
            else if (activeZoomOption == 2){ // Batalhão - BPM
                
                if (selected) {
                    var idBPM = event.feature.getProperty("AISP");
                    var bpmData = DPMap.getBPMInfos(idBPM);
                    bpmData.grandeArea = RISPMap.getRispName(bpmData.idRisp);
                    bpmData.populacao = PopulationMap.getPopulationByBPM(idBPM);
                    
                    info.innerHTML+= "<p><strong>Battalion: </strong>" + bpmData.id + "o.";
                    info.innerHTML+= "<p><strong>Estimated Pop: </strong>" + bpmData.populacao;
                    info.innerHTML+= "<p><strong>Large area: </strong>" + bpmData.grandeArea;
                    info.innerHTML+= "<p><strong>County: </strong>" + bpmData.municipio;
                    info.innerHTML+= "<p><strong>Territorial Unit: </strong>" + bpmData.unidadeTerritorial;
                    
                    if (!Utils.listContains(moduleExports.selectedAISPs, idBPM))
                        moduleExports.selectedAISPs.push({id: idBPM, name: (bpmData.id + "o.")});
                } else {
                    var idBPM = event.feature.getProperty("AISP");
                    Utils.listRemove(moduleExports.selectedAISPs, idBPM);
                }
                
                if(moduleExports.selectedAISPs.length || lastSelectedLength) {
                    lastSelectedLength = moduleExports.selectedAISPs.length;
                    var result;
                    var barResult;
                    if (activeQuantificationOption == 0) {
                        result = CrimeControl.querySelecteds("AISP (BPM)",moduleExports.selectedAISPs);
                        barResult = CrimeControl.querySelectedsForHistogram("AISP (BPM)", moduleExports.selectedAISPs);
                    }
                    else {
                        result = CrimeControl.querySelectedsByPop("AISP (BPM)", moduleExports.selectedAISPs, maxValue);
                        barResult = CrimeControl.querySelectedsForHistogramByPop("AISP (BPM)", moduleExports.selectedAISPs, maxValue);
                    }
                    
                    console.log(barResult);
                    SeriesControl.update(result, CrimeControl.timeWindow.isMonth);
                    BarsControl.update(barResult);
                }
            }
            else { // DP  
                
                if (selected) {
                    var idDP = event.feature.getProperty("DP").split("ª")[0];
                    var dpData = DPMap.getDPInfos(idDP);
                    dpData.grandeArea = RISPMap.getRispName(dpData.idRisp);
                    
                    info.innerHTML+= "<p><strong>DP: </strong>" + dpData.id + " - (" + dpData.dpName + ")";
                    info.innerHTML+= "<p><strong>Battalion: </strong>" + dpData.bpm + "o.";
                    info.innerHTML+= "<p><strong>Large area: </strong>" + dpData.grandeArea;
                    info.innerHTML+= "<p><strong>County:  </strong>" + dpData.municipio;
                    info.innerHTML+= "<p><strong>Territorial Unit: </strong>" + dpData.unidadeTerritorial;  
                    
                    if (!Utils.listContains(moduleExports.selectedDPs, idDP))
                        moduleExports.selectedDPs.push({id: idDP, name: (dpData.id + " - (" + dpData.dpName + ")")});
                         
                } else {
                    var idDP = event.feature.getProperty("DP").split("ª")[0];
                    
                    Utils.listRemove(moduleExports.selectedDPs, idDP);
                }
                
                if(moduleExports.selectedDPs.length || lastSelectedLength) {
                    lastSelectedLength = moduleExports.selectedDPs.length;
                    var result = CrimeControl.querySelecteds("DP",moduleExports.selectedDPs);
                    //console.log(result);
                    SeriesControl.update(result, CrimeControl.timeWindow.isMonth);
                    
                    var barResult = CrimeControl.querySelectedsForHistogram("DP", moduleExports.selectedDPs);
                    console.log(barResult);
                    BarsControl.update(barResult);
                }
            }
            
            /*if(selected)
            {
                var content = "<div id='infoBox' style = 'width:100px;'><strong>" + prefix + event.feature.getProperty(name) + "</strong></div>";
                moduleExports.infowindow.setContent(content);
                moduleExports.infowindow.setPosition(event.latLng);
                moduleExports.infowindow.open(moduleExports.map);
            }
            else
                moduleExports.infowindow.close();
                */
        });
    }
    
    
    moduleExports.forceLoadMapByZoom = function(zoomOption) {
        
        var firstTime = activeZoomOption == -1 ? true : false;
        activeZoomOption = zoomOption;
        moduleExports.OLD_clearMap();
        CrimeControl.clearTemps();
        
        var filename = "";
        
        //criamos um max temporario porque na visualização relativa, max será 100
        //então não podemos usar a mesma variável, senão perderemos o valor relativo calculado antes de multiplicar por 100
        var maxTemp = 0;
        
        if (zoomOption === 0) {
            filename = "./geo/LIMITE_RISP.geojson";
            maxValue = CrimeControl.queryMaxZoom("RISP", activeDataTypeOption);
            maxTemp = maxValue;
        } else if (zoomOption === 1) {
            filename = "./geo/rio-de-janeiro.geojson";
            
            if (activeQuantificationOption == 1) {
                maxValue = CrimeControl.queryMaxByPopZoom("Município", activeDataTypeOption);
                //var totalPopulation = PopulationMap.getPopulationByMunicipio("total");
                //totalPopulation = (totalPopulation == undefined) ? 0 : totalPopulation;
                
                //maxValue = totalPopulation != 0 ? (totalValue / totalPopulation) : 0;
                maxTemp = 100;
            } else {
                maxValue = CrimeControl.queryMaxZoom("Município", activeDataTypeOption);
                maxTemp = maxValue;
            }
        } else if (zoomOption === 2) {
            filename = "./geo/LIMITE_AISP.geojson";
            
            if (activeQuantificationOption == 1) {
                maxValue = CrimeControl.queryMaxByPopZoom("AISP (BPM)", activeDataTypeOption);
                /*var totalPopulation = PopulationMap.getPopulationByBPM("total");
                totalPopulation = (totalPopulation == undefined) ? 0 : totalPopulation;
                maxValue = totalPopulation != 0 ? (totalValue / totalPopulation) : 0;*/
                maxTemp = 100;
            } else {
                maxValue = CrimeControl.queryMaxZoom("AISP (BPM)", activeDataTypeOption);
                maxTemp = maxValue;
            }
        } else {
            filename = "./geo/LIMITE_DP.geojson";
            maxValue = CrimeControl.queryMaxDP(activeDataTypeOption);
            maxTemp = maxValue;
        }

        var newColorRange;
        if (activeDataTypeOption == 0) {
            newColorRange = colorbrewer.Oranges["8"];
        } else if (activeDataTypeOption == 1) {
            newColorRange = colorbrewer.Reds["8"];
        } else {
            newColorRange = colorbrewer.Blues["8"];
        }
        
        colorScale.range(newColorRange);
        colorScale.domain([0, maxTemp]);
        

        if (!firstTime)
            moduleExports.updateLegend(newColorRange);

        loadJSON(filename, function(response) {

            //código direto do google maps
            features = moduleExports.map.data.addGeoJson(/*JSON.parse(*/response/*)*/);

            //iterando na lista de polígonos para teste. Esse código pode ser colocado na hora que adiciona informação de bounds e center
            /*deleteMarkers();
            moduleExports.map.data.forEach(function(feature){

                var LatLng = feature.getProperty('center');
                var id = feature.getProperty('RISP');
                var marker = new google.maps.Marker({
                   position: LatLng,
                   map: moduleExports.map,
                   draggable: false,
                   id: id
                });
                allMarkers.push(marker);
                //moduleExports.map.data.remove(feature);
            });*/
        });
    }
    
    /*
    0 = Grandes áreas (RISP) //Unidade Territorial
    1 = Município
    2 = Batalhão
    3 = Delegacia
    */
    moduleExports.loadMapByZoom = function(zoomOption) {
        
        if (activeZoomOption != zoomOption) {
            moduleExports.forceLoadMapByZoom(zoomOption);
        }
    }
    
    moduleExports.init = function() {
        
        var mapStyle = [
                {
                    'stylers': [{'visibility': 'off'}]
                }, 
                {
                    'featureType': 'landscape',
                    'elementType': 'geometry',
                    'stylers': [{'visibility': 'on'}, {'color': '#fcfcfc'}]
                }, 
                {
                    'featureType': 'water',
                    'elementType': 'geometry',
                    'stylers': [{'visibility': 'on'}, {'color': '#bfd4ff'}]
                }
        ];
        
        moduleExports.map = new google.maps.Map(document.getElementById('map'),{
            zoom: 8,
            center: new google.maps.LatLng(-22.295506, -42.526635),
            //mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: mapStyle
        });
        
        google.maps.event.addDomListener(window, "resize", function() {
            var center = moduleExports.map.getCenter();
            google.maps.event.trigger(moduleExports.map, "resize");
            moduleExports.map.setCenter(center); 
        });
        
        moduleExports.loadMapByZoom(0);
        createEventsAndStyles();
        
        //criando svg para legenda do mapa
        createLegend();
    }
    
    moduleExports.OLD_clearMap = function(){
        SeriesControl.clear();
        BarsControl.clear();
        moduleExports.selectedCities = [];
        moduleExports.selectedRISPs = [];
        moduleExports.selectedAISPs = [];
        moduleExports.selectedDPs = [];
        lastSelectedLength = 0;
        
        var info = document.getElementById('infoMapDiv');
        info.innerHTML = "";
        
        if (!features)
            return;
        
        if (features.length){
            for (var i = 0; i < features.length; i++){
                if(features[i].length){
                    for(var j = 0; j < features[i].length; j++){
                        moduleExports.map.data.remove(features[i][j]);
                        features[i][j].setMap(null);
                    }
                }
                else{
                    moduleExports.map.data.remove(features[i]);
                    //features[i].setMap(null);
                }
            }
        }else{
            features.setMap(null);
        }
        
        if (moduleExports.infowindow.getMap()){
            moduleExports.infowindow.close();
        }
    }
    
    
    return moduleExports;
})();