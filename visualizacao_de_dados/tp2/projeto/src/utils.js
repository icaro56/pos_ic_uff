var Utils = (function() {
    
    'use strict';
    
    var moduleExports = {};
    
    //Código aqui
    
    moduleExports.listContains = function(selectedList, idObjecto) {
        for(var i = 0; i < selectedList.length; i++) {
            if (selectedList[i].id == idObjecto.toString()) {
                return true;
            }
        }
        
        return false;
    }
    
    moduleExports.listRemove = function(selectedList, idObjeto) {
        for( var i=selectedList.length-1; i>=0; i--) {
            if( selectedList[i].id == idObjeto) {
                selectedList.splice(i,1);
                break;
            }
        }
    }
    
    moduleExports.getListObject = function(selectedList, idObjeto) {
        for(var i = 0; i < selectedList.length; i++) {
            if (selectedList[i].id == idObjecto.toString()) {
                return selectedList[i];
            }
        }
        
        return null;
    }
    
    
    moduleExports.removeEndWhiteSpace = function(word) {
        word = word.replace(/\s*$/,"");
        return word;
    }
    
    moduleExports.readCSV_RISP_File = function(fileName, callback) {
            d3.text(fileName, function(error, raw){
                var dsv = d3.dsvFormat(';')
                var data = dsv.parse(raw)
                // do whatever you want with data
                data.forEach(function(dLine) {
                    dLine["RISP"] = +dLine["RISP"];
                    dLine["AISP (BPM)"] = +dLine["AISP (BPM)"];
                    dLine["CISP (DP)"] = +dLine["CISP (DP)"];
                });

                callback(data);
            })
    }

    moduleExports.readCSV_RISPName_File = function(fileName, callback) {
            d3.text(fileName, function(error, raw){
                var dsv = d3.dsvFormat(';')
                var data = dsv.parse(raw)
                // do whatever you want with data
                data.forEach(function(dLine) {
                    dLine["RISP"] = +dLine["RISP"];
                });

                callback(data);
            })
    }
    
    moduleExports.readCSV_PopulationBPM_File = function(fileName, callback) {
            d3.text(fileName, function(error, raw){
                var dsv = d3.dsvFormat(';')
                var data = dsv.parse(raw)
                // do whatever you want with data
                data.forEach(function(dLine) {
                    dLine["BPM"] = +dLine["BPM"];
                    dLine["Populacao2016"] = +dLine["Populacao2016"];
                });

                callback(data);
            })
    }    
    
    moduleExports.readCSV_PopulationMunicipio_File = function(fileName, callback) {
            d3.text(fileName, function(error, raw){
                var dsv = d3.dsvFormat(';')
                var data = dsv.parse(raw)
                // do whatever you want with data
                data.forEach(function(dLine) {
                    dLine["Populacao2016"] = +dLine["Populacao2016"];
                });
                callback(data);
            })
    }     
    //foi necessário usar uma função customizada para leitura, porque csv separado por ; não é mais considerado CSV
    moduleExports.readCSVFile = function(fileName, crimeIndex, year, filenamesLength, callback) {
            //d3.text('./dataset/Serie_Ameaca-2013.csv', function(error, raw){
            d3.text(fileName, function(error, raw){
                var dsv = d3.dsvFormat(';')
                var data = dsv.parse(raw)
                // do whatever you want with data
                data.forEach(function(dLine) {
                    /*Object.keys(dLine).forEach(function(origProp) {
                        var lowerCaseProp = moduleExports.removeEndWhiteSpace(origProp.toLocaleLowerCase());

                        if (lowerCaseProp !== origProp) {
                          dLine[lowerCaseProp] = dLine[origProp];
                          delete dLine[origProp];
                        }
                    });*/
                    
                    dLine["AISP (BPM)"] = +dLine["AISP (BPM)"];                    
                    dLine["CISP (DP)"] = +dLine["CISP (DP)"].split("a")[0];
                    
                    var DPs = DPMap.getDPs(dLine["CISP (DP)"]);
                    if (DPs !== undefined && DPs.length) {
                        /*dLine["RISP"] = DPs[0]["RISP"];
                        var nameRisp = RISPMap.getRispName(dLine["RISP"]);
                        if (nameRisp !== undefined) {
                             dLine["GrandeArea"] = nameRisp;
                        }*/
                        
                        dLine['Municípios'] = {};
                        for (var i = 0; i < DPs.length; i++) {
                            if (!dLine['Municípios'].hasOwnProperty(DPs[i]['Município']))
                                dLine['Municípios'][DPs[i]['Município']] = [DPs[i]['Município']];
                        }
                    }
                    
                    var firstDP = DPMap.getFirstDP(dLine["CISP (DP)"]);
                    
                    if (firstDP !== undefined) {
                        dLine["RISP"] = firstDP["RISP"];
                        dLine['Município'] = firstDP['Município'];
                        
                        var nameRisp = RISPMap.getRispName(dLine["RISP"]);
                        
                         if (nameRisp !== undefined) {
                             dLine["GrandeArea"] = nameRisp;
                         }
                    } 
                    
                    dLine.jan = isNaN(+dLine.jan) ? 0 : +dLine.jan;
                    dLine.fev = isNaN(+dLine.fev) ? 0 : +dLine.fev;
                    dLine.mar = isNaN(+dLine.mar) ? 0 : +dLine.mar;
                    dLine.abr = isNaN(+dLine.abr) ? 0 : +dLine.abr;
                    dLine.mai = isNaN(+dLine.mai) ? 0 : +dLine.mai;
                    dLine.jun = isNaN(+dLine.jun) ? 0 : +dLine.jun;
                    dLine.jul = isNaN(+dLine.jul) ? 0 : +dLine.jul;
                    dLine.ago = isNaN(+dLine.ago) ? 0 : +dLine.ago;
                    dLine.set = isNaN(+dLine.set) ? 0 : +dLine.set;
                    dLine.out = isNaN(+dLine.out) ? 0 : +dLine.out;
                    dLine.nov = isNaN(+dLine.nov) ? 0 : +dLine.nov;
                    dLine.dez = isNaN(+dLine.dez) ? 0 : +dLine.dez;
                    dLine.total = dLine.jan+dLine.fev+dLine.mar+dLine.abr+dLine.mai+dLine.jun+dLine.jul+dLine.ago+dLine.set+dLine.out+dLine.nov+dLine.dez;
                });

                callback(data, crimeIndex, year, filenamesLength);
            })
    }
    
    return moduleExports;
})();