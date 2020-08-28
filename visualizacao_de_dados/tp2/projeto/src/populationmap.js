var PopulationMap = (function() {
    
    'use strict';
    
    var self = {};
    
    //dicionário se cria assim.
    self.mapPopulationByBPM = {}; 
    self.mapPopulationByMunicipio = {}; 

    self.init = function(callback) {
        Utils.readCSV_PopulationBPM_File('./dataset/dicionarios/Populacao2016BPM.csv', function(data) {
            //console.log(JSON.stringify(data,null, '\t'));
                
            var totalPopulationBPM = 0;
            for(var i = 0; i < data.length; i++) {
                var key = data[i]["BPM"];
                if (!self.mapPopulationByBPM.hasOwnProperty(key)) {
                    self.mapPopulationByBPM[key] = data[i]["Populacao2016"];
                    totalPopulationBPM += self.mapPopulationByBPM[key];
                }        
            }
            self.mapPopulationByBPM["total"] = totalPopulationBPM;
            
            //console.log(self.mapPopulationByBPM);
            
            Utils.readCSV_PopulationMunicipio_File('./dataset/dicionarios/Populacao2016Municipio.csv', function(data) {
                //console.log(JSON.stringify(data,null, '\t'));

                var totalPopulationCity = 0;
                for(var i = 0; i < data.length; i++) {
                    var key = data[i]["Municipio"];
                    if (!self.mapPopulationByMunicipio.hasOwnProperty(key)) {
                        self.mapPopulationByMunicipio[key] = data[i]["Populacao2016"];
                        totalPopulationCity += self.mapPopulationByMunicipio[key];
                    }        
                }
                self.mapPopulationByMunicipio["total"] = totalPopulationCity;

                //console.log(self.mapPopulationByMunicipio);
                callback();
            });
                                            
        });
    }
    
    self.getPopulationByBPM = function(keyBPM) {
        if (self.containsBPM(keyBPM)) {
            return self.mapPopulationByBPM[keyBPM];
        }
        
        return undefined;
    }
    
    
    self.containsBPM = function(keyBPM) {
        if (self.mapPopulationByBPM.hasOwnProperty(keyBPM))
            return true;
        
        return false;
    }

    self.getPopulationByMunicipio= function(keyMunicipio) {
        if (self.containsMunicipio(keyMunicipio)) {
            return self.mapPopulationByMunicipio[keyMunicipio];
        }
        
        return undefined;
    }
    
    
    self.containsMunicipio = function(keyMunicipio) {
        if (self.mapPopulationByMunicipio.hasOwnProperty(keyMunicipio))
            return true;
        
        return false;
    }
    
    return self;
})();