var myApp = (function(){
    
    'use strict';

    var self = {};

    self.run = function () 
    {
       // tentativa de mostrar os gráficos
       var margins = {
            top: 10,
            bottom: 50,
            left: 55,
            right: 150
        };
        
        //arquivo de dps é carregado aqui
        DPMap.init(function() {
            
            //Nomes das grandes áreas associados aos ids das RISPs são carregados
            RISPMap.init( function () {
                
                //Tamanho da população em cada BPM e em cada Municipio são carregados
                PopulationMap.init( function () {
                    
                    //módulo criado para controlar arquivos de crimes que são carregados
                    CrimeControl.init(function() {

                        //mapa é criado aqui
                        Map.init();

                        //eventos de interface e carregamentos dinâmicos são inicializados aqui.
                        GUI.init();
                    });                
                });                
            });
        });
    }

    window.onload = self.run;

    return {
        update: self.update
    };
    
})();
