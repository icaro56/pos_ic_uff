var DPMap = (function() {
    
    'use strict';
    
    var self = {};
    
    //dicionário se cria assim.
    self.map = {}; 
    
    self.init = function(callback) {
        Utils.readCSV_RISP_File('./dataset/dicionarios/RelacaodasRISP_AISP.csv', function(data) {
            //console.log(JSON.stringify(data,null, '\t'));
                
            for(var i = 0; i < data.length; i++) {
                var key = data[i]["CISP (DP)"];
                if (self.map.hasOwnProperty(key)) {
                    self.map[key].push(data[i]);
                    
                } else {
                    self.map[key] = new Array(data[i]);
                }        
            }
            
            //console.log(self.map);
            callback();
        });
    }

    //Retorna sempre um array
    self.getDPs = function(keyDP) {
        if (self.containsDP(keyDP)) {
            return self.map[keyDP];
        }
        
        return undefined;
    }
    
    //Retorna um objeto
    self.getFirstDP = function(keyDP) {
        if (self.containsDP(keyDP)) {
            return self.map[keyDP][0];
        }
        
        return undefined;
    }
    
    self.containsDP = function(keyDP) {
        if (self.map.hasOwnProperty(keyDP))
            return true;
        
        return false;
    }
    
    // Recupera informações (Nome da DP, BPM, município, Unidade territorial e id da grande área) a partir do id da delagacia
    self.getDPInfos = function(keyDP) {
        if (self.containsDP(keyDP)) {
            var dpData = self.map[keyDP];
            var dpInfo = {}
            for(var i = 0; i < dpData.length; i++) { 
                dpInfo.id = keyDP;
                if(dpInfo.dpName !== undefined)  {
                    if(dpInfo.dpName.indexOf(dpData[i]["Nome DP"]) == -1) {
                        dpInfo.dpName =  dpInfo.dpName.replace(" e ", ", ");
                        dpInfo.dpName += ", " + dpData[i]["Nome DP"];
                    }
                }
                else
                    dpInfo.dpName = dpData[i]["Nome DP"];
                
                dpInfo.bpm = +dpData[i]["AISP (BPM)"];    
                
                if(dpInfo.municipio !== undefined) {
                    if(dpInfo.municipio.indexOf(dpData[i]["Município"]) == -1) {
                        dpInfo.municipio =  dpInfo.municipio.replace(" e ", ", ");
                        dpInfo.municipio += ", " + dpData[i]["Município"];
                    }
                }
                else
                    dpInfo.municipio = dpData[i]["Município"];                
                
                dpInfo.idRisp = +dpData[i]["RISP"];   
                
                if(dpInfo.unidadeTerritorial !== undefined) {
                    if(dpInfo.unidadeTerritorial.indexOf(dpData[i]["Unidade Territorial"]) == -1) {
                        dpInfo.unidadeTerritorial =  dpInfo.unidadeTerritorial.replace(" e ", ", ");
                        dpInfo.unidadeTerritorial += ", " + dpData[i]["Unidade Territorial"];
                    }
                }
                else
                    dpInfo.unidadeTerritorial = dpData[i]["Unidade Territorial"];                   
            }           
            
            return dpInfo;
        }
        return undefined;
    }    
    
    // Recupera informações (município, Unidade territorial e id da grande área) a partir do id do batalhão
    self.getBPMInfos = function(keyBPM) {
        var bpmInfo = undefined;
        var dp = null;
        for(var i in self.map) {
            dp = self.map[i];
            for (var j = 0; j < dp.length; j++){
                if (dp[j]["AISP (BPM)"] == keyBPM){
                    if(bpmInfo == undefined) {      
                        bpmInfo = {};
                    }
                    bpmInfo.id = keyBPM;
                    bpmInfo.idRisp = dp[j]["RISP"];

                    if(bpmInfo.municipio !== undefined) {
                        if(bpmInfo.municipio.indexOf(dp[j]["Município"]) == -1) {
                            bpmInfo.municipio =  bpmInfo.municipio.replace(" e ", ", ");
                            bpmInfo.municipio += ", " + dp[j]["Município"];
                        }
                    }
                    else
                        bpmInfo.municipio = dp[j]["Município"];      

                    // falta buscar para ver se se repete para,se for o caso não incluir
                    if(bpmInfo.unidadeTerritorial !== undefined) {
                        if(bpmInfo.unidadeTerritorial.indexOf(dp[j]["Unidade Territorial"]) == -1) {
                            bpmInfo.unidadeTerritorial =  bpmInfo.unidadeTerritorial.replace(" e ", ", ");
                            bpmInfo.unidadeTerritorial += ", " + dp[j]["Unidade Territorial"];
                        }
                    }
                    else
                        bpmInfo.unidadeTerritorial = dp[j]["Unidade Territorial"];
                } 
            }
        }
        
        return bpmInfo;
    }
    
    // Recupera informações (id da grande área) a partir do nome do municipio
    self.getMunicipioInfos = function(keyMunicipio) {
        var municipioInfo = undefined;
        var dp = null;
        for(var i in self.map) {
            dp = self.map[i];
            for (var j = 0; j < dp.length; j++){
                if (dp[j]["Município"] == keyMunicipio){
                    if(municipioInfo == undefined) {      
                        municipioInfo = {};
                    }
                    municipioInfo.municipio = keyMunicipio;
                    municipioInfo.idRisp = dp[j]["RISP"];
                    
                    if(municipioInfo.bpm !== undefined) {
                        if(municipioInfo.bpm.indexOf(dp[j]["AISP (BPM)"]) == -1) 
                            municipioInfo.bpm += ", " + dp[j]["AISP (BPM)"].toString();
                    }
                    else
                        municipioInfo.bpm = dp[j]["AISP (BPM)"].toString();                
                    
                } 
            }
        }
        
        return municipioInfo;
    }    
    return self;
})();