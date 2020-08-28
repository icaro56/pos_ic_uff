var Files = (function() {
    
    'use strict';
    
    var moduleExports = {};
    
    moduleExports.policeReactionsFilesNames = [
        "Serie_Apreensao_De_Armas",
        "Serie_Apreensao_de_Drogas",
        "Serie_Apreensao_de_Menor",
        "Serie_Prisoes_GRP",
        "Serie_Recuperacao_de_Veiculo"
    ];
    
    moduleExports.policeReactionsNames = [
        "Seizure of Weapons",
        "Seizure of Drugs",
        "Seizure of Minor",
        "GRP prison",
        "Vehicle Recovery"
    ];
    
    moduleExports.occurrencesFileNames = [
        "Serie_Ameaca",
        "Serie_Estupro",
        "Serie_Furto_De_Veiculos",
        "Serie_Homicidio_Culposo",
        "Serie_Homicidio_Doloso",
        "Serie_Latrocinio_Roubo_seguido_de_morte",
        "Serie_Lesao_Corporal_Culposa_Transito",
        "Serie_Lesao_Corporal_Dolosa",
        "Serie_Lesao_Corporal_Seguida_de_Morte",
        "Serie_Roubo_A_Banco",
        "Serie_Roubo_a_Estabelecimento_Comercial",
        "Serie_Roubo_A_Residencia",
        "Serie_Roubo_de_Aparelho_Celular",
        "Serie_Roubo_de_Caixa_Eletronico",
        "Serie_Roubo_de_Carga",
        "Serie_Roubo_de_Transeunte",
        "Serie_Roubo_em_Coletivo",
        "Serie_Roubo_Veiculo",
        "Serie_Tentativa_de_Homicidio"
    ];
    
    moduleExports.occurrencesNames = [
        "Threat",
        "Rape",
        "Vehicle Theft",
        "Manslaughter",
        "Premeditated Murder",
        "Robbery Followed by Death",
        "Bodily Injury In Traffic",
        "Willful Bodily Injury",
        "Bodily Injury Followed by Death",
        "Bank Robbery",
        "Commercial Establishment Robbery",
        "Residence Robbery",
        "Cell Phone Robbery",
        "Cash Machine Robbery",
        "Cargo Robbery",
        "Walker Robbery",
        "Collective Transport Robbery",
        "Vehicle Robbery",
        "Homicide Attempted"
    ];
    
    moduleExports.totalFileNames = [
        //"Serie_Total_de_Furtos",
        "Serie_Total_de_RO"/*,
        "Serie_Total_de_Roubos"*/
    ];
    
    moduleExports.totalNames = [
        //"Total de Furtos",
        "Total Occurrence Records"/*,
        "Total de Roubos"*/
    ];
    
    moduleExports.years = [
        "2013",
        "2014",
        "2015",
        "2016",
        "2017"
    ];
    
    var validYears = function(years) {
        if (years == undefined || years.length == 0 || years.constructor !== Array) {
            years = moduleExports.years;
        }
        
        return years;
    }
    
    //segundo parâmetro é um array. Retorna apenas anos passados caso informado.
    moduleExports.getTotalFileNames = function(index, years) {
        var aux = new Array();
        years = validYears(years);
        
        if (years == undefined || years.length == 0 || years.constructor !== Array) {
            years = moduleExports.years;
        }
        
        if (index >= 0 && index < moduleExports.totalFileNames.length) {
            for (var i = 0; i < years.length; i++) {
                aux.push((moduleExports.totalFileNames[index] + "-" + years[i].toString() + ".csv"));
            }
        }
        
        return aux;
    }
    
    moduleExports.getAllTotalFileNames = function(year) {
        var aux = new Array();
        //years = validYears(years);
        
        for (var index = 0; index < moduleExports.totalFileNames.length; index++) {
            //for (var i = 0; i < years.length; i++) {
                aux.push((moduleExports.totalFileNames[index] + "-" + year + ".csv"));
            //}
        }
        
        return aux;
    }
    
    moduleExports.getOccurrencesFileNames = function(index, years) {
        var aux = new Array();
        years = validYears(years);
        
        if (index >= 0 && index < moduleExports.occurrencesFileNames.length) {
            for (var i = 0; i < years.length; i++) {
                aux.push((moduleExports.occurrencesFileNames[index] + "-" + years[i].toString() + ".csv"));
            }
        }
        
        return aux;
    }
    
    moduleExports.getAllOccurrencesFileNames = function(year) {
        var aux = new Array();
        //years = validYears(years);
        
        for (var index = 0; index < moduleExports.occurrencesFileNames.length; index++) {
            //for (var i = 0; i < years.length; i++) {
                aux.push((moduleExports.occurrencesFileNames[index] + "-" + year + ".csv"));
            //}
        }
        
        return aux;
    }
    
    moduleExports.getAllPoliceReactionsFileNames = function(year) {
        var aux = new Array();
        //years = validYears(years);
        
        for (var index = 0; index < moduleExports.policeReactionsFilesNames.length; index++) {
            //for (var i = 0; i < years.length; i++) {
                aux.push((moduleExports.policeReactionsFilesNames[index] + "-" + year + ".csv"));
            //}
        }
        
        return aux;
    }
    
    
    
    return moduleExports;
})();