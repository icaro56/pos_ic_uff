var RISPMap = (function() {
    
    'use strict';
    
    var self = {};
    
    //dicionário se cria assim.
    self.mapRispNameById = {}; 

    self.init = function(callback) {
        Utils.readCSV_RISPName_File('./dataset/dicionarios/RelacaodasRISP_GrandesAreas.csv', function(data) {
            //console.log(JSON.stringify(data,null, '\t'));
                
            for(var i = 0; i < data.length; i++) {
                var key = data[i]["RISP"];
                if (!self.mapRispNameById.hasOwnProperty(key)) {
                    self.mapRispNameById[key] = data[i]["Nome"];
                }        
            }
            
            //console.log(self.mapRispNameById);
            callback();
        });
    }
    
    //Retorna sempre um array
    self.getRispName = function(keyRISP) {
        if (self.containsRISP(keyRISP)) {
            return self.mapRispNameById[keyRISP];
        }
        
        return undefined;
    }
    
    
    self.containsRISP = function(keyRISP) {
        if (self.mapRispNameById.hasOwnProperty(keyRISP))
            return true;
        
        return false;
    }
    
    return self;
})();